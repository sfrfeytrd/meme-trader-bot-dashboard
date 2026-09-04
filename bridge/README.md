# Scanner / Engine Bridge

Local paper-trading bridge between the existing scanner (`:8787`) and trading engine (`:8790`).

## Run

From this directory:

`node index.js`

Or use `Start_Bridge.bat` from Windows.

Environment variables are optional; defaults point to the existing local scanner and paper engine.

The bridge refuses to forward signals unless the engine health endpoint reports `mode=paper`.

It also monitors open paper positions for the configured stop-loss and take-profit thresholds. No wallet/private key is used by this bridge.
