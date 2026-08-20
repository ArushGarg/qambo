# Setup (VS Code)

No API keys or external accounts needed — everything runs locally.

## 1. Open the folder in VS Code
File → Open Folder → select this `qambo` folder.

## 2. Create a virtual environment and install dependencies
Open a terminal in VS Code (`` Ctrl+` ``) and run:

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

## 3. Select the interpreter / kernel
- Install the **Python** and **Jupyter** extensions in VS Code if you don't
  have them already.
- Press `Ctrl+Shift+P` → "Python: Select Interpreter" → choose the one at
  `./venv/...` (`venv\Scripts\python.exe` on Windows,
  `venv/bin/python` on macOS/Linux).
- Open any `0X_qambo_*.ipynb` notebook, click the kernel picker in the
  top-right corner, and pick the same `venv` interpreter.

## 4. Run
- `00_random_action.ipynb` is the fastest one to try first (baseline, no
  training) — run all cells top to bottom.
- `01_qambo_ddqn.ipynb` through `11_...ipynb` each train a different Deep Q
  Learning variant. They use realistic scale (`SIM_DURATION = 5000`,
  `TRAINING_EPISODES = 50`), so a full run genuinely takes a while on CPU —
  that's expected. Reduce `SIM_DURATION` / `TRAINING_EPISODES` near the top
  of a notebook if you just want a quick smoke test.
- Results save automatically to `output/` (CSV + PNG) as each notebook
  finishes.

See `FIXES.md` for the bugs that were fixed in `amboworld/` to make this run
on modern package versions, and exactly what was verified.
