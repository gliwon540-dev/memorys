/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
  "여기에_SUPABASE_URL";

const SUPABASE_KEY =
  "여기에_SUPABASE_PUBLISHABLE_KEY";


const db =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================
   VARIABLES
========================================= */

let currentStep = 1;

let selectedEmotions = [];

let selectedFeeling = [];

let selectedCategory = "";

let memories = [];

let currentFilter = "전체";


/* =========================================
   PAGE MOVE
========================================= */

function goTo(id) {

  const element =
    document.getElementById(id);

  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth"
  });

}


/* =========================================
   STEP
========================================= */

function showStep(step) {

  if (step < 1) {
    step = 1;
  }

  if (step > 4) {
    step = 4;
  }

  currentStep = step;


  /* 모든 단계 숨기기 */

  document
    .querySelectorAll(".memory-step")
    .forEach((item) => {

      item.classList.remove("active");

    });


  /* 현재 단계만 표시 */

  const current =
    document.querySelector(
      `.memory-step[data-step="${step}"]`
    );


  if (current) {

    current.classList.add("active");

  }


  /* dots */

  const dots =
    document.querySelectorAll(
      ".progress-dots i"
    );


  dots.forEach((dot, index) => {

    if (index === step - 1) {

      dot.classList.add("active");

    } else {

      dot.classList.remove("active");

    }

  });


  /* 이전 */

  const prev =
    document.getElementById("prevBtn");


  if (step === 1) {

    prev.style.visibility = "hidden";

  } else {

    prev.style.visibility = "visible";

  }


  /* 다음 */

  const next =
    document.getElementById("nextBtn");


  const save =
    document.getElementById("saveBtn");


  if (step === 4) {

    next.style.display = "none";

    save.style.display = "block";

  } else {

    next.style.display = "block";

    save.style.display = "none";

  }

}


/* =========================================
   NEXT
========================================= */

document
  .getElementById("nextBtn")
  .addEventListener("click", function () {

    /* STEP 1 */

    if (currentStep === 1) {

      const input =
        document.getElementById(
          "memoryInput"
        );


      if (!input.value.trim()) {

        alert(
          "먼저 기억을 적어주세요."
        );

        input.focus();

        return;

      }

    }


    /* STEP 2 */

    if (currentStep === 2) {

      if (
        selectedEmotions.length === 0
      ) {

        alert(
          "감정을 하나 이상 선택해주세요."
        );

        return;

      }

    }


    /* STEP 3 */

    if (currentStep === 3) {

      if (
        selectedFeeling.length === 0
      ) {

        alert(
          "지금의 기분을 하나 선택해주세요."
        );

        return;

      }

    }


    showStep(currentStep + 1);

  });


/* =========================================
   PREVIOUS
========================================= */

document
  .getElementById("prevBtn")
  .addEventListener("click", function () {

    showStep(currentStep - 1);

  });


/* =========================================
   EMOTIONS
========================================= */

document
  .querySelectorAll(
    "[data-emotion]"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      function () {

        const emotion =
          this.dataset.emotion;


        this.classList.toggle(
          "selected"
        );


        if (
          this.classList.contains(
            "selected"
          )
        ) {

          if (
            !selectedEmotions.includes(
              emotion
            )
          ) {

            selectedEmotions.push(
              emotion
            );

          }

        } else {

          selectedEmotions =
            selectedEmotions.filter(
              item => item !== emotion
            );

        }

      }
    );

  });


/* =========================================
   CURRENT FEELING
========================================= */

document
  .querySelectorAll(
    "[data-feeling]"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      function () {

        document
          .querySelectorAll(
            "[data-feeling]"
          )
          .forEach((item) => {

            item.classList.remove(
              "selected"
            );

          });


        this.classList.add(
          "selected"
        );


        selectedFeeling = [
          this.dataset.feeling
        ];

      }
    );

  });


/* =========================================
   CATEGORY
========================================= */

document
  .querySelectorAll(
    "[data-category]"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      function () {

        document
          .querySelectorAll(
            ".category-grid [data-category]"
          )
          .forEach((item) => {

            item.classList.remove(
              "selected"
            );

          });


        this.classList.add(
          "selected"
        );


        selectedCategory =
          this.dataset.category;

      }
    );

  });


/* =========================================
   SAVE MEMORY
========================================= */

document
  .getElementById("saveBtn")
  .addEventListener(
    "click",
    async function () {

      const memory =
        document
          .getElementById(
            "memoryInput"
          )
          .value
          .trim();


      const reflection =
        document
          .getElementById(
            "reflectionInput"
          )
          .value
          .trim();


      if (!memory) {

        showStep(1);

        alert(
          "기억을 적어주세요."
        );

        return;

      }


      if (!selectedCategory) {

        alert(
          "기억의 카테고리를 선택해주세요."
        );

        return;

      }


      this.disabled = true;

      this.textContent =
        "저장하는 중...";


      const {
        data,
        error
      } = await db
        .from("memories")
        .insert({

          memory: memory,

          emotions:
            selectedEmotions.join(", "),

          current_feeling:
            selectedFeeling.join(", "),

          reflection:
            reflection,

          category:
            selectedCategory

        })
        .select()
        .single();


      this.disabled = false;

      this.textContent =
        "기억 남기기";


      if (error) {

        console.error(error);

        alert(
          "저장에 실패했습니다.\n\n" +
          "Supabase 설정을 확인해주세요."
        );

        return;

      }


      /* 성공 메시지 */

      const message =
        document.getElementById(
          "saveMessage"
        );


      message.style.display = "block";

      message.innerHTML =
        "✓ 기억이 남겨졌어요.<br>" +
        "다른 사람들도 이 기억을 볼 수 있습니다.";


      /* 초기화 */

      resetMemoryForm();


      /* archive 이동 */

      setTimeout(() => {

        goTo("archive");

      }, 700);

    }
  );


/* =========================================
   RESET
========================================= */

function resetMemoryForm() {

  document.getElementById(
    "memoryInput"
  ).value = "";


  document.getElementById(
    "reflectionInput"
  ).value = "";


  selectedEmotions = [];

  selectedFeeling = [];

  selectedCategory = "";


  document
    .querySelectorAll(
      ".emotion-grid button"
    )
    .forEach((button) => {

      button.classList.remove(
        "selected"
      );

    });


  document
    .querySelectorAll(
      ".category-grid button"
    )
    .forEach((button) => {

      button.classList.remove(
        "selected"
      );

    });


  showStep(1);

}


/* =========================================
   LOAD MEMORIES
========================================= */

async function loadMemories() {

  const list =
    document.getElementById(
      "memoryList"
    );


  list.innerHTML =
    `<div class="empty">
      기억을 불러오는 중...
    </div>`;


  const {
    data,
    error
  } = await db
    .from("memories")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {

    console.error(error);

    list.innerHTML =
      `<div class="empty">
        기억을 불러오지 못했습니다.
      </div>`;

    return;

  }


  memories = data || [];


  renderMemories();

}


/* =========================================
   RENDER
========================================= */

function renderMemories() {

  const list =
    document.getElementById(
      "memoryList"
    );


  const count =
    document.getElementById(
      "memoryCount"
    );


  count.textContent =
    memories.length;


  let filtered =
    memories;


  if (currentFilter !== "전체") {

    filtered =
      memories.filter(
        memory =>
          memory.category ===
          currentFilter
      );

  }


  if (filtered.length === 0) {

    list.innerHTML =
      `<div class="empty">
        아직 남겨진 기억이 없어요.<br>
        첫 번째 기억을 남겨보세요.
      </div>`;

    return;

  }


  list.innerHTML = "";


  filtered.forEach(
    (memory, index) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "memory-card";


      card.innerHTML = `

        <div class="memory-number">
          MEMORY #${String(
            index + 1
          ).padStart(2, "0")}
        </div>

        <h3>
          “${safe(
            memory.memory
          )}”
        </h3>

        ${
          memory.emotions
            ? `
              <div class="memory-emotions">
                당시의 감정 ·
                ${safe(
                  memory.emotions
                )}
              </div>
            `
            : ""
        }

        ${
          memory.current_feeling
            ? `
              <div class="memory-emotions">
                지금의 기분 ·
                ${safe(
                  memory.current_feeling
                )}
              </div>
            `
            : ""
        }

        ${
          memory.reflection
            ? `
              <div class="memory-reflection">
                기억이 남긴 생각<br>
                “${safe(
                  memory.reflection
                )}”
              </div>
            `
            : ""
        }

        ${
          memory.category
            ? `
              <div class="memory-category">
                ${safe(
                  memory.category
                )}
              </div>
            `
            : ""
        }

      `;


      list.appendChild(card);

    }
  );

}


/* =========================================
   FILTER
========================================= */

document
  .querySelectorAll(
    "[data-filter]"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      function () {

        document
          .querySelectorAll(
            "[data-filter]"
          )
          .forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );


        this.classList.add(
          "active"
        );


        currentFilter =
          this.dataset.filter;


        renderMemories();

      }
    );

  });


/* =========================================
   REALTIME
========================================= */

function startRealtime() {

  db
    .channel(
      "memories-live"
    )

    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "memories"
      },
      function (payload) {

        const exists =
          memories.some(
            memory =>
              memory.id ===
              payload.new.id
          );


        if (!exists) {

          memories.unshift(
            payload.new
          );


          renderMemories();

        }

      }
    )

    .subscribe();

}


/* =========================================
   ESCAPE HTML
========================================= */

function safe(value) {

  return String(value || "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================
   EMPATHY
========================================= */

function empathy(message) {

  document.getElementById(
    "empathyResult"
  ).textContent =
    `“${message}” 마음이 전달되었어요.`;

}


/* =========================================
   START
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    showStep(1);

    loadMemories();

    startRealtime();

  }
);
