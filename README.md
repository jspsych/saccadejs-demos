# SaccadeJS demos

Runnable copies of the three experiments behind the SaccadeJS paper, with every upload removed.
**None of them saves or sends any data**: webcam clips and measurements stay in the browser tab
and are discarded. Served with GitHub Pages at <https://jspsych.github.io/saccadejs-demos/>.

| Demo | What it is | Source |
|---|---|---|
| [`training/`](training/) | The training-set task (`eyedata23`), run on Prolific from June 2023 to April 2024 | The copy deployed at `cogsciresearch.vassar.edu/jdeleeuw/eyedata23/`. It is [jspsych/eyedata](https://github.com/jspsych/eyedata)'s `tag-important-trials` branch (79451a4) with the save moved after the consent questions. |
| [`held-out/`](held-out/) | The held-out-set task (`eyedata24`), run in December 2024 and March 2025 | The copy deployed at `cogsciresearch.vassar.edu/jdeleeuw/eyedata24/`: jspsych/eyedata-test (private; 420f042) with data labels on the webcam, glasses and consent questions, the save moved after the consent questions, and the second study's completion code. 166 of the 307 saved sessions ran this version; the other 141, all in December 2024, ran 420f042, whose save came before the consent questions. Participants saw the same screens in the same order apart from that. |
| [`validation/`](validation/) | The validation study comparing SaccadeJS with WebGazer, September 2026 | jspsych/eyetracking-cookoff-exp (private) at tag `v1.4.1`: `index.html`, `css/`, `js/` and `lib/` (the saccade.js bundles from saccadejs 7b8666d, the model, and ONNX Runtime 1.29.0) |

`?short` runs the training and held-out tasks with two detection trials and four others per
block, for a quick look.

## What changed for the demos

Every change is marked with a `DEMO` comment.

**Training and held-out** (`experiment.js`, `index.html`):

- The per-trial video upload (`server/save_webm.php`) and the end-of-session saves of the data
  and the interaction log (`server/save_json.php`) are removed. The clips are still recorded, as
  in the study, but stay in the tab. The `server/` PHP scripts are not included.
- The redirect to Prolific at the end, with its completion code, is replaced by an end screen.
- A demo screen comes first, and the "Saving data" and last screens say that nothing is saved.
  Everything else, including the study's own text, is unchanged.
- The CDN versions are pinned (below). Line endings are converted from CRLF to LF.

**Validation** (`js/config.js`, `js/save.js`, `js/experiment.js`, `css/cookoff.css`):

- `save.mode` is a new `"none"`, which saves nothing and offers no download. The DataPipe
  experiment ID and the Prolific completion code are removed.
- The welcome, upload and end screens say that it is a demo and nothing is saved.

## jsPsych versions

The validation study pinned every version, and the demo keeps them: jsPsych 8.2.3 and plugins
2.1.0.

The training and held-out tasks loaded jsPsych from unpkg with version ranges, so each session
got whatever matched on the day. The demos pin what those ranges resolved to, from npm's release
dates:

| Package | Range in the study | Training, June–Aug 2023 (650 sessions) | Training, Dec 2023–Apr 2024 (1,430 sessions) | Held-out, Dec 2024 and Mar 2025 | Demo |
|---|---|---|---|---|---|
| jspsych | `jspsych` (training), `jspsych@7` (held-out) | 7.3.3 | 7.3.4 | 7.3.4 | 7.3.4 |
| plugin-html-button-response | `@1.1` | 1.1.2 | 1.1.3 | 1.1.3 | 1.1.3 |
| plugin-html-keyboard-response | `@1.1` | 1.1.2 | 1.1.3 | 1.1.3 | 1.1.3 |
| plugin-fullscreen | `@1` | 1.2.0 | 1.2.1 | 1.2.1 | 1.2.1 |
| plugin-browser-check | `@1.0.2` | 1.0.2 | 1.0.2 | 1.0.2 | 1.0.2 |
| plugin-call-function | `@1` | 1.1.2 | 1.1.3 | 1.1.3 | 1.1.3 |
| jspsych CSS | `jspsych@7.2/css` | 7.2.3 | 7.2.3 | 7.2.3 | 7.2.3 |

Session counts are approved Prolific submissions by start date. The jsPsych 7.3.4 and plugin
releases of 15 November 2023 fall between the two halves of the training collection; the demo
uses the later versions, which most training sessions and every held-out session loaded. The
camera plugins (`initialize-camera`, `mirror-camera`, `html-video-response`) were served from the
experiments' own folders and are included as deployed.

## Running locally

Any static server works, from the repository root:

    python3 -m http.server 8000

then open <http://localhost:8000/>. Browsers allow the camera only on `https://` or `localhost`.
