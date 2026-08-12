/* =========================================
   SUPABASE
========================================= */

let db = null;

const SUPABASE_URL = "여기에_SUPABASE_URL";
const SUPABASE_KEY = "여기에_SUPABASE_PUBLISHABLE_KEY";

try {
  if (
    window.supabase &&
    SUPABASE_URL.startsWith("http") &&
    !SUPABASE_URL.includes("여기에")
  ) {
    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }
} catch (error) {
  console.log("Supabase 연결 대기 중");
}


/* =========================================
   MEMORY VARIABLES
========================================= */

let currentStep = 1;

let selectedEmotions = [];

let selectedFeeling = "";

let selectedCategory = "";

let memories = [];

let currentFilter = "전체";


/* =========================================
   화면 이동
========================================= */

function goTo(id) {

  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({
      behavior: "smooth"
    });
  }

}


/* =========================================
   기억 단계 표시
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

  const steps =
    document.querySelectorAll(".memory-step");

  steps.forEach(function(item) {

    item.classList.remove("active");

  });


  /* 현재 단계 표시 */

  const current =
    document.querySelector(
      '.memory-step[data-step="' + step + '"]'
    );

  if (current) {
    current.classList.add("active");
  }


  /* 점 */

  const dots =
    document.querySelectorAll(
      ".progress-dots i"
    );

  dots.forEach(function(dot, index) {

    if (index === step - 1) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }

  });


  /* 이전 버튼 */

  const prev =
    document.getElementById("prevBtn");

  if (prev) {

    if (step === 1) {
      prev.style.visibility = "hidden";
    } else {
      prev.style.visibility = "visible";
    }

  }


  /* 다음 / 저장 버튼 */

  const next =
    document.getElementById("nextBtn");

  const save =
    document.getElementById("saveBtn");

  if (step === 4) {

    if (next) {
      next.style.display = "none";
    }

    if (save) {
      save.style.display = "block";
    }

  } else {

    if (next) {
      next.style.display = "block";
    }

    if (save) {
      save.style.display = "none";
    }

  }

}


/* =========================================
   다음 버튼
========================================= */

function nextStep() {

  /* 1단계 */

  if (currentStep === 1) {

    const input =
      document.getElementById("memoryInput");

    if (!input || !input.value.trim()) {

      alert("먼저 기억을 적어주세요.");

      if (input) {
        input.focus();
      }

      return;
    }

  }


  /* 2단계 */

  if (currentStep === 2) {

    if (selectedEmotions.length === 0) {

      alert("감정을 하나 이상 선택해주세요.");

      return;
    }

  }


  /* 3단계 */

  if (currentStep === 3) {

    if (!selectedFeeling) {

      alert("지금의 기분을 하나 선택해주세요.");

      return;
    }

  }


  /* 실제 다음 단계 */

  showStep(currentStep + 1);

}


/* =========================================
   이전 버튼
========================================= */

function previousStep() {

  showStep(currentStep - 1);

}


/* =========================================
   감정 선택
========================================= */

function setupEmotions() {

  const buttons =
    document.querySelectorAll(
      "[data-emotion]"
    );

  buttons.forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        const emotion =
          this.dataset.emotion;


        this.classList.toggle("selected");


        if (
          this.classList.contains("selected")
        ) {

          if (
            !selectedEmotions.includes(emotion)
          ) {

            selectedEmotions.push(emotion);

          }

        } else {

          selectedEmotions =
            selectedEmotions.filter(
              function(item) {
                return item !== emotion;
              }
            );

        }

      }
    );

  });

}


/* =========================================
   지금의 기분
========================================= */

function setupFeelings() {

  const buttons =
    document.querySelectorAll(
      "[data-feeling]"
    );

  buttons.forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        buttons.forEach(
          function(item) {
            item.classList.remove("selected");
          }
        );


        this.classList.add("selected");

        selectedFeeling =
          this.dataset.feeling;

      }
    );

  });

}


/* =========================================
   카테고리
========================================= */

function setupCategories() {

  const buttons =
    document.querySelectorAll(
      "[data-category]"
    );

  buttons.forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        buttons.forEach(
          function(item) {
            item.classList.remove("selected");
          }
        );


        this.classList.add("selected");

        selectedCategory =
          this.dataset.category;

      }
    );

  });

}


/* =========================================
   기억 저장
========================================= */

async function saveMemory() {

  const memoryInput =
    document.getElementById("memoryInput");

  const reflectionInput =
    document.getElementById("reflectionInput");


  const memory =
    memoryInput.value.trim();

  const reflection =
    reflectionInput.value.trim();


  if (!memory) {

    showStep(1);

    alert("기억을 적어주세요.");

    return;

  }


  if (!selectedCategory) {

    alert("기억의 카테고리를 선택해주세요.");

    return;

  }


  /* Supabase가 아직 연결되지 않은 경우 */

  if (!db) {

    alert(
      "기억 회상 기능은 정상적으로 작동합니다.\n\n" +
      "다만 아직 Supabase 연결 정보가 입력되지 않았어요."
    );

    return;

  }


  const saveButton =
    document.getElementById("saveBtn");

  saveButton.disabled = true;

  saveButton.textContent = "저장 중...";


  const result =
    await db
      .from("memories")
      .insert({

        memory: memory,

        emotions:
          selectedEmotions.join(", "),

        current_feeling:
          selectedFeeling,

        reflection:
          reflection,

        category:
          selectedCategory

      })
      .select()
      .single();


  saveButton.disabled = false;

  saveButton.textContent = "기억 남기기";


  if (result.error) {

    console.error(result.error);

    alert(
      "기억을 저장하지 못했어요.\n" +
      "Supabase 설정을 확인해주세요."
    );

    return;

  }


  const message =
    document.getElementById(
      "saveMessage"
    );


  message.style.display = "block";

  message.textContent =
    "✓ 기억이 남겨졌어요.";


  resetMemory();

  await loadMemories();

  setTimeout(function() {

    goTo("archive");

  }, 500);

}


/* =========================================
   기억 초기화
========================================= */

function resetMemory() {

  document.getElementById(
    "memoryInput"
  ).value = "";


  document.getElementById(
    "reflectionInput"
  ).value = "";


  selectedEmotions = [];

  selectedFeeling = "";

  selectedCategory = "";


  document
    .querySelectorAll(
      ".emotion-grid button"
    )
    .forEach(function(button) {

      button.classList.remove("selected");

    });


  document
    .querySelectorAll(
      ".category-grid button"
    )
    .forEach(function(button) {

      button.classList.remove("selected");

    });


  showStep(1);

}


/* =========================================
   기억 불러오기
========================================= */

async function loadMemories() {

  if (!db) {

    renderMemories();

    return;

  }


  const result =
    await db
      .from("memories")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (result.error) {

    console.error(result.error);

    return;

  }


  memories =
    result.data || [];


  renderMemories();

}


/* =========================================
   기억 표시
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


  if (count) {
    count.textContent =
      memories.length;
  }


  let filtered =
    memories;


  if (currentFilter !== "전체") {

    filtered =
      memories.filter(
        function(memory) {

          return (
            memory.category ===
            currentFilter
          );

        }
      );

  }


  if (filtered.length === 0) {

    list.innerHTML = `
      <div class="empty">
        아직 남겨진 기억이 없어요.<br>
        첫 번째 기억을 남겨보세요.
      </div>
    `;

    return;

  }


  list.innerHTML = "";


  filtered.forEach(
    function(memory, index) {

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
          “${safe(memory.memory)}”
        </h3>

        ${
          memory.emotions
            ? `
              <div class="memory-emotions">
                당시의 감정 ·
                ${safe(memory.emotions)}
              </div>
            `
            : ""
        }

        ${
          memory.current_feeling
            ? `
              <div class="memory-emotions">
                지금의 기분 ·
                ${safe(memory.current_feeling)}
              </div>
            `
            : ""
        }

        ${
          memory.reflection
            ? `
              <div class="memory-reflection">
                기억이 남긴 생각<br>
                “${safe(memory.reflection)}”
              </div>
            `
            : ""
        }

        ${
          memory.category
            ? `
              <div class="memory-category">
                ${safe(memory.category)}
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
   카테고리 필터
========================================= */

function setupFilters() {

  document
    .querySelectorAll(
      "[data-filter]"
    )
    .forEach(function(button) {

      button.addEventListener(
        "click",
        function() {

          document
            .querySelectorAll(
              "[data-filter]"
            )
            .forEach(
              function(item) {
                item.classList.remove(
                  "active"
                );
              }
            );


          this.classList.add("active");


          currentFilter =
            this.dataset.filter;


          renderMemories();

        }
      );

    });

}


/* =========================================
   실시간 업데이트
========================================= */

function startRealtime() {

  if (!db) {
    return;
  }


  db
    .channel("memories-live")

    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "memories"
      },
      function(payload) {

        const exists =
          memories.some(
            function(memory) {

              return (
                memory.id ===
                payload.new.id
              );

            }
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
   HTML 안전 처리
========================================= */

function safe(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================
   공감
========================================= */

function empathy(message) {

  const result =
    document.getElementById(
      "empathyResult"
    );


  result.textContent =
    "“" + message + "” 마음이 전달되었어요.";

}


/* =========================================
   시작
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    /* 가장 먼저 회상 단계 실행 */

    showStep(1);


    /* 버튼 연결 */

    const next =
      document.getElementById("nextBtn");

    const prev =
      document.getElementById("prevBtn");

    const save =
      document.getElementById("saveBtn");


    if (next) {

      next.addEventListener(
        "click",
        nextStep
      );

    }


    if (prev) {

      prev.addEventListener(
        "click",
        previousStep
      );

    }


    if (save) {

      save.addEventListener(
        "click",
        saveMemory
      );

    }


    setupEmotions();

    setupFeelings();

    setupCategories();

    setupFilters();

    loadMemories();

    startRealtime();

  }
);
