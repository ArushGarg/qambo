# qambo — fixes applied to make the repo runnable

No API keys, credentials, or external services are needed anywhere in this
repo — it's a fully self-contained local simulation + PyTorch training
pipeline. Nothing to provide on your end.

## Environment / dependencies

The repo's `binder/environment.yml` pins package versions from 2020
(Python 3.7, gym 0.17, PyTorch 1.5, numpy 1.18) which are impractical to
install today. I installed and verified against modern equivalents instead
(Python 3.12):

```
numpy==2.5.2
pandas==3.0.5
matplotlib==3.11.1
simpy==4.1.2
gym==0.26.2
torch==2.13.0
```

These are captured in `requirements.txt`. Install with:

```
pip install -r requirements.txt
```

`gym` prints a deprecation warning on import ("Gym has been unmaintained
since 2022... upgrade to Gymnasium") — this is harmless noise, not an error.
The code only uses `gym.Env` and `gym.spaces`, both of which still work
identically in Gymnasium if you ever want to migrate; no code changes were
needed to make it run against gym 0.26.

## Bugs found and fixed (all in `amboworld/`)

### 1. `amboworld/ambulance.py` — wrong index for initial y-coordinate
```python
# before
self.dispatch_y = self._env.dispatch_points[self.dispatch_point][0]
# after
self.dispatch_y = self._env.dispatch_points[self.dispatch_point][1]
```
Every newly created ambulance had its y-coordinate copied from its x-coordinate
instead of the real y value, so ambulances started life at the wrong spot on
the map (only self-corrected the first time they got a real dispatch
assignment via `step()`).

### 2. `amboworld/environment.py::_set_dispatch_points` — crash on non-square `number_dispatch_points`
```python
# before
for _ in range(self.add_random):
# after
for _ in range(add_random):
```
`self.add_random` was never set anywhere — it referenced a nonexistent
attribute. This crashed with `AttributeError` for any `number_dispatch_points`
that isn't a perfect square (e.g. 10, 20 — anything other than 25 which is
5², or 4, 9, 16...). All the notebooks happen to use `NUMBER_DISPTACH_POINTS
= 25`, which is why this was never hit in the shipped runs, but it would
break immediately for any other grid size.

### 3. `amboworld/environment.py::_calculate_reward` — crash when no response yet recorded
```python
# before
reward = None
if len(self.reward_response_times) > 0:
    reward = 0 - self.reward_response_times.pop(0)
reward = 0 - reward ** 2          # TypeError if reward is still None

# after
if len(self.reward_response_times) == 0:
    return 0
response_time = self.reward_response_times.pop(0)
reward = 0 - response_time ** 2
```
If a `step()` was called before any ambulance had completed a
response yet, `reward` stayed `None` and the unconditional `reward ** 2`
raised `TypeError: unsupported operand type(s) for ** or pow(): 'NoneType' and 'int'`.
This is easy to trigger with fewer ambulances / longer incident intervals,
or just bad luck early in an episode. Now it returns a neutral reward of `0`
instead of crashing.

## Verification performed

- Ran the environment directly (bypassing notebooks) with default params
  (5000+ steps) — passes.
- Deliberately triggered the non-square dispatch-point crash and the
  empty-reward-history crash pre-fix to confirm the bugs were real, then
  confirmed both are gone post-fix.
- Rebuilt the full `01_qambo_ddqn.ipynb` training loop (DQN class, replay
  memory, optimizer, plotting) as a standalone script at reduced scale and
  ran it end-to-end against the modern numpy 2.x / torch 2.x stack —
  training, target-net sync, best-model tracking, and result CSV/PNG output
  all work with no code changes needed there. Every other notebook
  (02–11) shares the same `DQN`/`Memory`/`optimize` pattern plus additive,
  self-contained pieces (`NoisyLinear`, `NaivePrioritizedBuffer`, bagging
  loops) that don't touch the environment, so they run on the same fixed
  `amboworld` package without further changes.

## To run for real

The notebooks use realistic-scale settings (`SIM_DURATION = 5000`,
`TRAINING_EPISODES = 50`, `REPLAY_START_SIZE = 50000`), so a full training
run per notebook will take a while on CPU — that's expected, not a bug.
Just:

```
pip install -r requirements.txt
jupyter lab
```
then open any of the `0X_qambo_*.ipynb` notebooks and run all cells top to
bottom.
