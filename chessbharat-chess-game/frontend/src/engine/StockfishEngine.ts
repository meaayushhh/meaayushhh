import type { Square } from '../utils/fen';

/** Filename of the bundled Stockfish 19 Lite single-threaded worker. */
export const ENGINE_FILENAME = 'stockfish-19-lite-single.js';

/**
 * Thin wrapper around the Stockfish 19 Lite (single-threaded WASM) engine,
 * run in a classic Web Worker and driven over the UCI protocol.
 *
 * Design goals from the brief:
 *  - search runs off the main UI thread (Web Worker)
 *  - lazy-loaded (constructed only when a game starts)
 *  - supports termination and restart
 *  - a new position supersedes an in-flight search (sequence guard + caller
 *    validation)
 *  - engine output is validated before use
 *  - recovers gracefully from worker failure
 *  - no cross-origin isolation headers required (single-threaded build)
 */

export interface SearchRequest {
  fen: string;
  movetimeMs?: number;
  depth?: number;
}

export interface ParsedMove {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

const SQUARE_RE = /^[a-h][1-8]$/;

/** Parse a UCI bestmove token ("e2e4", "e7e8q") into a move, or null. */
export function parseBestMove(token: string): ParsedMove | null {
  if (!token || token === '(none)' || token === '0000') return null;
  const from = token.slice(0, 2);
  const to = token.slice(2, 4);
  const promo = token.slice(4, 5);
  if (!SQUARE_RE.test(from) || !SQUARE_RE.test(to)) return null;
  const move: ParsedMove = { from: from as Square, to: to as Square };
  if (promo) {
    if (!/^[qrbn]$/.test(promo)) return null;
    move.promotion = promo as ParsedMove['promotion'];
  }
  return move;
}

/** A ranked engine candidate from a MultiPV search. */
export interface Candidate {
  /** First move of the principal variation. */
  move: ParsedMove;
  uci: string;
  /** Centipawn score from the side-to-move's perspective (mate folded in). */
  scoreCp: number;
  /** Mate-in-N (signed) if this line forces mate, else null. */
  mate: number | null;
  /** 1 = engine's best line. */
  rank: number;
}

const MATE_CP = 100000;

type LineSub = (line: string) => void;

export class StockfishEngine {
  private worker: Worker | null = null;
  private subs = new Set<LineSub>();
  private searchSeq = 0;
  private dead = false;

  constructor(private readonly url: string) {}

  get alive(): boolean {
    return this.worker !== null && !this.dead;
  }

  /** Create the worker and complete the UCI handshake. */
  async init(timeoutMs = 15000): Promise<void> {
    if (this.worker) return;
    this.dead = false;

    let rejectOnError: (reason: Error) => void = () => {};
    const errorP = new Promise<never>((_, reject) => {
      rejectOnError = reject;
    });

    const worker = new Worker(this.url);
    this.worker = worker;
    worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data?.data ?? '');
      if (line) for (const s of [...this.subs]) s(line);
    };
    worker.onerror = () => {
      this.dead = true;
      rejectOnError(new Error('engine: worker error'));
    };

    try {
      this.post('uci');
      await Promise.race([this.once((l) => l.includes('uciok'), timeoutMs), errorP]);
      this.post('isready');
      await Promise.race([this.once((l) => l.includes('readyok'), timeoutMs), errorP]);
    } catch (err) {
      this.terminate();
      throw err instanceof Error ? err : new Error('engine: init failed');
    }
  }

  private post(cmd: string): void {
    this.worker?.postMessage(cmd);
  }

  /** Resolve with the first line matching `pred`, or reject on timeout. */
  private once(pred: (line: string) => boolean, timeoutMs: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.subs.delete(sub);
        reject(new Error('engine: timed out'));
      }, timeoutMs);
      const sub: LineSub = (line) => {
        if (pred(line)) {
          clearTimeout(timer);
          this.subs.delete(sub);
          resolve(line);
        }
      };
      this.subs.add(sub);
    });
  }

  setOption(name: string, value: string | number): void {
    this.post(`setoption name ${name} value ${value}`);
  }

  /** Stockfish "Skill Level" 0–20. */
  setSkillLevel(level: number): void {
    const n = Math.max(0, Math.min(20, Math.round(level)));
    this.setOption('Skill Level', n);
  }

  newGame(): void {
    this.post('ucinewgame');
    this.post('isready');
  }

  stop(): void {
    this.post('stop');
  }

  /**
   * Search the given position and resolve with the best-move token.
   * A later call supersedes this one (the stale result rejects), and the
   * caller must still validate the move against the current position.
   */
  async search(req: SearchRequest): Promise<string> {
    if (!this.worker || this.dead) throw new Error('engine: not available');
    const seq = ++this.searchSeq;
    this.post('stop');
    this.post(`position fen ${req.fen}`);
    const go = req.depth != null ? `go depth ${req.depth}` : `go movetime ${req.movetimeMs ?? 1000}`;
    this.post(go);

    const budget = (req.movetimeMs ?? 3000) + 20000;
    const line = await this.once((l) => l.startsWith('bestmove'), budget);
    if (seq !== this.searchSeq) throw new Error('engine: search superseded');
    const m = line.match(/^bestmove\s+(\S+)/);
    return m ? m[1] : '(none)';
  }

  /**
   * MultiPV search: returns up to `multipv` ranked candidate moves with scores,
   * so a personality layer can choose among reasonable options. A later search
   * supersedes this one (stale result rejects).
   */
  async searchMultiPV(req: {
    fen: string;
    movetimeMs?: number;
    depth?: number;
    multipv: number;
  }): Promise<Candidate[]> {
    if (!this.worker || this.dead) throw new Error('engine: not available');
    const seq = ++this.searchSeq;
    const lines = new Map<number, { depth: number; scoreCp: number; mate: number | null; uci: string }>();

    const collector: LineSub = (line) => {
      if (!line.startsWith('info') || !line.includes(' multipv ')) return;
      const mpv = /\bmultipv (\d+)/.exec(line);
      const depth = /\bdepth (\d+)/.exec(line);
      const pv = /\bpv (\S+)/.exec(line);
      const cp = /\bscore cp (-?\d+)/.exec(line);
      const mate = /\bscore mate (-?\d+)/.exec(line);
      if (!mpv || !pv) return;
      const idx = Number(mpv[1]);
      const d = depth ? Number(depth[1]) : 0;
      const prev = lines.get(idx);
      if (prev && prev.depth > d) return; // keep the deepest info per line
      let scoreCp = 0;
      let mateN: number | null = null;
      if (mate) {
        mateN = Number(mate[1]);
        scoreCp = (mateN > 0 ? 1 : -1) * (MATE_CP - Math.abs(mateN));
      } else if (cp) {
        scoreCp = Number(cp[1]);
      }
      lines.set(idx, { depth: d, scoreCp, mate: mateN, uci: pv[1] });
    };

    this.subs.add(collector);
    try {
      this.post('stop');
      this.setOption('MultiPV', Math.max(1, req.multipv));
      this.post(`position fen ${req.fen}`);
      this.post(req.depth != null ? `go depth ${req.depth}` : `go movetime ${req.movetimeMs ?? 1000}`);
      const budget = (req.movetimeMs ?? 3000) + 20000;
      await this.once((l) => l.startsWith('bestmove'), budget);
    } finally {
      this.subs.delete(collector);
    }
    if (seq !== this.searchSeq) throw new Error('engine: search superseded');

    const out: Candidate[] = [];
    for (const [rank, info] of [...lines.entries()].sort((a, b) => a[0] - b[0])) {
      const move = parseBestMove(info.uci);
      if (move) out.push({ move, uci: info.uci, scoreCp: info.scoreCp, mate: info.mate, rank });
    }
    return out;
  }

  terminate(): void {
    this.searchSeq++; // invalidate any pending search
    try {
      this.worker?.terminate();
    } catch {
      /* ignore */
    }
    this.worker = null;
    this.subs.clear();
    this.dead = false;
  }
}
