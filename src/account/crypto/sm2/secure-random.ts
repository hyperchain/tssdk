/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
// fork from jsbn

// Pool size must be a multiple of 4 and greater than 32.
// An array of bytes the size of the pool will be passed to init()
const rng_psize = 256;
// prng4.js - uses Arcfour as a PRNG
class Arcfour {
  private i: number;
  private j: number;
  private S: number[];
  constructor() {
    this.i = 0;
    this.j = 0;
    this.S = [];
  }
  // Initialize arcfour context from key, an array of ints, each from [0..255]
  public init(key: number[]) {
    let i: number, j: number, t: number;
    for (i = 0; i < 256; ++i) this.S[i] = i;
    j = 0;
    for (i = 0; i < 256; ++i) {
      j = (j + this.S[i] + key[i % key.length]) & 255;
      t = this.S[i];
      this.S[i] = this.S[j];
      this.S[j] = t;
    }
    this.i = 0;
    this.j = 0;
  }
  public next() {
    this.i = (this.i + 1) & 255;
    this.j = (this.j + this.S[this.i]) & 255;
    const t = this.S[this.i];
    this.S[this.i] = this.S[this.j];
    this.S[this.j] = t;
    return this.S[(t + this.S[this.i]) & 255];
  }
}
// Plug in your RNG constructor here
function prng_newstate(): Arcfour {
  return new Arcfour();
}

let rng_state: Arcfour;
let rng_pool: number[] | null = null;
let rng_pptr: number;

// Mix in a 32-bit integer into the pool
function rng_seed_int(x: number) {
  rng_pool![rng_pptr++] ^= x & 255;
  rng_pool![rng_pptr++] ^= (x >> 8) & 255;
  rng_pool![rng_pptr++] ^= (x >> 16) & 255;
  rng_pool![rng_pptr++] ^= (x >> 24) & 255;
  if (rng_pptr >= rng_psize) rng_pptr -= rng_psize;
}

// Mix in the current time (w/milliseconds) into the pool
function rng_seed_time() {
  rng_seed_int(new Date().getTime());
}

// Initialize the pool with junk if needed.
if (rng_pool == null) {
  rng_pool = [];
  rng_pptr = 0;
  let t;
  if (typeof window !== "undefined" && window.crypto) {
    if (window.crypto.getRandomValues) {
      // Use webcrypto if available
      const ua = new Uint8Array(32);
      window.crypto.getRandomValues(ua);
      for (t = 0; t < 32; ++t) rng_pool[rng_pptr++] = ua[t];
    }
    // duplicate
    // else if (navigator.appName == "Netscape" && navigator.appVersion < "5") {
    //     // Extract entropy (256 bits) from NS4 RNG if available
    //     var z = window.crypto.random(32);
    //     for (t = 0; t < z.length; ++t)
    //         rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
    // }
  }
  while (rng_pptr < rng_psize) {
    // extract some randomness from Math.random()
    t = Math.floor(65536 * Math.random());
    rng_pool[rng_pptr++] = t >>> 8;
    rng_pool[rng_pptr++] = t & 255;
  }
  rng_pptr = 0;
  rng_seed_time();
}

function rng_get_byte() {
  if (rng_state == null) {
    rng_seed_time();
    rng_state = prng_newstate();
    rng_state.init(rng_pool!);
    for (rng_pptr = 0; rng_pptr < rng_pool!.length; ++rng_pptr) rng_pool![rng_pptr] = 0;
    rng_pptr = 0;
  }
  return rng_state.next();
}

function rng_get_bytes(ba: number[]) {
  let i;
  for (i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
}

export class SecureRandom {
  public nextBytes = rng_get_bytes;
}
