// DEMO: a copy of the deployed study with every upload removed. See ../README.md.
const DEMO_SHORT = new URLSearchParams(window.location.search).has("short");
const DEMO_END = `<div class="demo-intro"><h2>End of the demo</h2>
  <p>Nothing was saved. <a href="../">Back to the demos</a></p></div>`;

const n_phases = 2;
const n_test_trials = 144;
const n_test_trials_per_block = 48;
const n_blocks = n_test_trials / n_test_trials_per_block;
const trial_duration = 500;
const saccade_time = 1000;
const min_x = 5;
const max_x = 95;
const min_y = 5;
const max_y = 95;

let n_complete = 0;


const jsPsych = initJsPsych({
  on_finish: ()=>{
    // DEMO: the study sent participants back to Prolific here.
    jsPsych.getDisplayElement().innerHTML = DEMO_END;
  }
});


const subject_id = jsPsych.randomization.randomID(8);

const prolific_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
const study_id = jsPsych.data.getURLVariable('STUDY_ID');
const session_id = jsPsych.data.getURLVariable('SESSION_ID');

jsPsych.data.addProperties({
  subject_id: subject_id,
  prolific_id: prolific_id,
  study_id: study_id,
  session_id: session_id
});

// Instructions
const instructions = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Thanks for participating in our experiment!</p>
            <p>We are developing tools to help researchers measure eye movements during online experiments.</p>
            <p>Eye tracking is a commonly used method in psychological experiments, but is currently difficult to do online.</p>
            <p>Your participation in this experiment will help us test new tools for eye tracking so that future experiments can get better data.</p>`,
      choices: ["Continue"],
      css_classes: ["instructions"],
    },
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<p>You need to use a device with a keyboard to complete this experiment.</p>
      <p>Press the spacebar now to verify you have a keyboard.</p>`,
      choices: [" "],
      css_classes: ["instructions"],
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>In order to complete this experiment, you will need to allow us to record from your device's camera.</p>
            <p>We will record without audio, and each recording will be only about one second long.</p>
            <p>The video files that we record will become part of a public dataset that researchers can use to test new tools for eye tracking.</p>
            <p>If you are not comfortable with the videos we record during this experiment being released to the public, you should exit the experiment.</p>
            <p>You will also have a chance at the end of the experiment to decide whether to exclude your data from the public dataset, in case you change your mind during the experiment.</p>`,
      choices: ["I understand that the videos will be public"],
      css_classes: ["instructions"],
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Let's begin by getting your camera ready.</p>`,
      choices: ["Continue"],
      css_classes: ["instructions"],
    },
  ],
};

// Camera Setup
const cameraSetup = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>When you click the button below you will be prompted to allow access to your camera.</p>
        <p>If you have more than one camera connected to your computer, you can select which one to use.</p>`,
      choices: ["Continue"],
      css_classes: ["instructions"],
    },
    {
      type: jsPsychInitializeCamera,
      width: 480,
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
         <p>Are you using an integrated or external webcam? Image below for reference:
         <div style='width: 960px;'>
         <div style='float: left;'><img src='img/Webcam Prompt Image.jpg'></img> 
         `,
      choices: ["Integrated Webcam", "External Webcam"],
      data: {
        task: 'webcam-type'
      } 
    },
    {
      type: jsPsychMirrorCamera,
      prompt:
        `<p>Please adjust the camera, your position, and the lighting to get a good view of your face and especially your eyes. Here are some tips:</p>
        <ul>
          <li>To avoid backlighting, make sure a strong light is in front of you.</li>
          <li>If you wear glasses, try to reduce glare on the lenses as much as possible.</li>
          <li>You should be the only face in frame.</li>
        </ul>
        <p>If you can clearly see the whites of your eyes, you're likely in a good spot!</p>`
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: "<p>Before we begin, will you be wearing glasses for the experiment? Your data will be included whether you wear glasses or not.</p>",
      choices: ["Yes, I am wearing glasses.", "No, I am not wearing glasses."],
      data: {
        task: 'glasses'
      }
    },
  ],
};
// face detection model expects 192 x 192 cropped images

// Fullscreen
const fullscreen = {
  timeline: [
    {
      type: jsPsychFullscreen,
      fullscreen_mode: true,
      message: `<p>Now that your camera is set up, we will switch to fullscreen mode for the experiment.</p>`,
      button_label: "Enter Fullscreen",
      delay_after: 200,
    },
  ],
};

const getAspectRatio = {
  timeline: [
    {
      type: jsPsychBrowserCheck,
      features: ["width", "height", "fullscreen"],
      on_finish: function(data) {
        data.aspect_ratio = data.width / data.height
      },
    },
  ],
};

const practiceTrials = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: () => {
        return `<div style="position: relative; width:100vw; height: 100vh; cursor: none;"><div class="fixation-point" style="top:${jsPsych.timelineVariable(
          "y"
        )}%; left:${jsPsych.timelineVariable("x")}%;"></div></div>`;
      },
      choices: "NO_KEYS",
      trial_duration: saccade_time + trial_duration,
      data: {
        task: 'practice',
        x: jsPsych.timelineVariable("x"),
        y: jsPsych.timelineVariable("y"),
      }
    },
    {
      timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        stimulus: () => {
          return `<div style="position: relative; width:100vw; height: 100vh; cursor: none;"><div class="fixation-point dot-detect" style="top:${jsPsych.timelineVariable(
            "y"
          )}%; left:${jsPsych.timelineVariable("x")}%;"></div></div>
          <div style="position: absolute; bottom: 5%; width:100vw; text-align: center;"><p>Press the spacebar when the dot turns red.</p></div>`;
        },
        choices: [" "],
        data: {
          task: 'practice',
          x: jsPsych.timelineVariable("x"),
          y: jsPsych.timelineVariable("y"),
        }
      }],
      conditional_function: function(){
        return jsPsych.timelineVariable('detect');
      }
    }
  ],
  timeline_variables: [
    {x: 50, y: 50, detect: false},
    {x: 25, y: 25, detect: false},
    {x: 75, y: 75, detect: true},
  ]
}


// Task Instructions
const taskInstructions = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>The rest of the experiment will involve looking at specific locations on your screen while we record video.</p>
        <p>We will show you this dot at different places on your screen.</p> 
        <div style="position: relative; width:100%; height: 2em;"><div class="fixation-point" style="top:50%; left:50%;"></div></div>
        <p>While the dot is on the screen, please keep your gaze locked onto the dot.</p>`,
      choices: ["Continue"],
      css_classes: ["instructions"],
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Sometimes the dot will turn red and black, like this:</p> 
        <div style="position: relative; width:100%; height: 2em;"><div class="fixation-point dot-detect" style="top:50%; left:50%;"></div></div>
        <p>When this happens, please press the spacebar as quickly as you can.</p>
        <p>We'll do a quick practice now.</p>`,
      choices: ["Continue"],
      css_classes: ["instructions"],
    },
    practiceTrials,
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Great! We're ready almost ready to begin.</p>`,
      choices: ["Continue"],
      css_classes: ["instructions"],
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>There are ${
        n_test_trials * n_phases
      } dots that will be shown. Each one will be on the screen for ${
        (trial_duration + saccade_time) / 1000
      } seconds.</p>
      <p>There will be a five short breaks in the experiment to let you take a moment to rest your eyes.</p>
      <p>Please try to remain focused on the dot for the entire experiment.</p> `,
      choices: ["I'm ready to begin"],
      post_trial_gap: 2000,
      css_classes: ["instructions"],
    },
  ],
};

// Recording Trials
// 16:9 grid of 144 fixation points across 3 blocks. Points are randomly sampled w/o replacement.

// Generate coordinates for grid of pints

function create_point_grid() {
  const point_grid = [];
  for (let x = 5; x <= 95; x += (90/15)) {
    for(let y = 5; y <= 95; y += (90/8)) {
        point_grid.push([x, y]);
    }
  }
  return point_grid;
}


// Test stimuli array
const test_parameters = [];

for (let p = 0; p < n_phases; p++) {
  const point_grid = create_point_grid();
  for (let b = 0; b < n_blocks; b++) {
    const block = [];
    for (let i = 0; i < n_test_trials_per_block; i++) {
      let idx = Math.floor(Math.random() * point_grid.length); // Generate a random index in range of point_grid
      let point = point_grid[idx]; // Get the randomly selected point
      point_grid.splice(idx, 1); // Remove point from point_grid
      block.push({
        x: point[0],
        y: point[1],
        type: "test",
        phase: p+1,
        detect: i < 10 ? true : false, // First 10 trials are detect trials
      });
    }
    test_parameters.push(block);
  }
}

const preTestTrial = { // start fo every block
  type: jsPsychCallFunction,
  func: (done) => {   
    const display = jsPsych.getDisplayElement();
    display.innerHTML = `
      <div style="position: relative; width:100vw; height: 100vh; cursor: none;">
        <div class="fixation-point" style="top:${jsPsych.timelineVariable("y")}%; left:${jsPsych.timelineVariable("x")}%;"></div>
      </div>`;
    setTimeout(done, saccade_time);
  },
  async: true
}

const testTrial = {
  type: jsPsychHtmlVideoResponse,
  stimulus: () => {
    return `<div style="position: relative; width:100vw; height: 100vh; cursor: none;"><div class="fixation-point" style="top:${jsPsych.timelineVariable(
      "y"
    )}%; left:${jsPsych.timelineVariable("x")}%;"></div></div>`;
  },
  recording_duration: trial_duration,
  show_done_button: false,
  data: {
    x: jsPsych.timelineVariable("x"),
    y: jsPsych.timelineVariable("y"),
    phase: jsPsych.timelineVariable("phase"),
  },
  on_finish: (data) => {
    n_complete++;
    // DEMO: the study uploaded the video here (server/save_webm.php). Nothing is sent.
    // this overwrites the base64 video data with the filename
    data.response = `${subject_id}_${data.phase}_${data.x}_${data.y}.webm`;
  },
};

const dotDetectionTrial = {
  timeline: [{
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
      return `<div style="position: relative; width:100vw; height: 100vh; cursor: none;"><div class="fixation-point dot-detect" style="top:${jsPsych.timelineVariable(
        "y"
      )}%; left:${jsPsych.timelineVariable("x")}%;"></div></div>`;
    },
    choices: [" "],
    data: {
      task: 'dot_detection',
      x: jsPsych.timelineVariable("x"),
      y: jsPsych.timelineVariable("y"),
    }
  }],
  conditional_function: function(){
    return jsPsych.timelineVariable('detect');
  }
}

const break_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: () => {
    return `<p>You have completed ${n_complete} of the ${
      n_test_trials * n_phases
    } trials.</p>
    <p>When you are ready to move on, click the button below.</p>`;
  },
  choices: ["Continue"],
  post_trial_gap: 2000,
};

const test = {
  timeline: [],
};


for (let b = 0; b < test_parameters.length; b++) { // test_parameters.length == n_blocks * n_phases

  const block = {
    timeline: [preTestTrial, testTrial, dotDetectionTrial],
    timeline_variables: test_parameters[b],
    data: {
      block: b
    },
    randomize_order: true,
  };
  test.timeline.push(block);
  test.timeline.push(break_trial);
}

const save_all = {
  type: jsPsychCallFunction,
  func: (done) => {
    const display = jsPsych.getDisplayElement();
    display.innerHTML = `<p>Saving data. This takes about 10 seconds.</p><p class="demo-note">(Demo: nothing is saved.)</p>`;
    // DEMO: the study saved the session data and the interaction log here
    // (server/save_json.php). Nothing is sent.
    setTimeout(done, 10000);
  },
  aysnc: true
};

const exit_full_screen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false,
}

const final_survey = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Thank you for participating!</p>
      <p>The videos that we just recorded will be made available to the public for research purposes.</p>
      <p>This will help the research community develop better tools for eye tracking on the web.</p>
      <p>If you do not want your videos to be part of this public dataset, you can opt out by clicking the button below.</p>`,
      choices: ["It is OK for my videos to be public", "I do not want my videos to be public"],
      data: {
        task: 'public-videos'
      }
    },
    {
      timeline: [
        {
          type: jsPsychHtmlButtonResponse,
          stimulus: `<p>We will remove your videos from the public dataset.</p>
          <p>Is it OK for us to use these videos in our own research? Only members of our research team will have access.</p>`,
          choices: ["You can use my videos for research", "Please delete my videos completely"],
          data: {
            task: 'research-videos'
          }
        }
      ],
      conditional_function: () => {
        return jsPsych.data.getLastTrialData().values()[0].response === 1;
      }
    },
  ]
}

const final_instructions = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Thank you for your participation. The study is now complete. Click the button below to return to Prolific.</p>
      <p class="demo-note">(Demo: this button ends the demo instead.)</p>`,
      choices: ["Return to Prolific"],
    },
  ],
};

// DEMO: what this page is, before the study's own first screen.
const demo_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `<div class="demo-intro">
    <h2>SaccadeJS dataset: the held-out evaluation task</h2>
    <p>This is the experiment that collected the held-out evaluation data, as participants ran it from
    December 2024 and March 2025, with the same code and jsPsych versions.</p>
    <p><strong>Nothing is saved or sent anywhere.</strong> The study uploaded a short webcam video
    on every trial and saved the session at the end; this demo removes both. Your camera is
    used only to show you the preview and to record clips that stay in this tab and are
    discarded.</p>
    <p>The questions about webcams, glasses and sharing your videos are the study's own; your
    answers go nowhere.</p>
    ${DEMO_SHORT ? "<p>This is the short version: a few trials per block.</p>"
                  : `<p>The full task takes about 10 to 15 minutes. <a href="?short">Run a short version</a>
                     with a few trials per block instead.</p>`}
  </div>`,
  choices: ["Start the demo"],
};

// DEMO: ?short keeps two detection trials and four others in each block.
if (DEMO_SHORT) {
  for (const block of test.timeline) {
    if (!block.timeline_variables) continue;
    const vars = block.timeline_variables;
    block.timeline_variables = vars.filter((v) => v.detect).slice(0, 2)
      .concat(vars.filter((v) => !v.detect).slice(0, 4));
  }
}

// Run Experiment
jsPsych.run([
  demo_intro,
  instructions,
  cameraSetup,
  fullscreen,
  getAspectRatio,
  taskInstructions,
  test,
  final_survey,
  save_all,
  exit_full_screen,
  final_instructions,
]);