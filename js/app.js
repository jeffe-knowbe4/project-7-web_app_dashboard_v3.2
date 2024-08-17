const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

document.addEventListener("DOMContentLoaded", () => {
  $("body").addEventListener("click", (e) => {
    const el = e.target;
    if (el.classList.contains("close")) {
      el.parentNode.style.display = "none";
    }
    if (el.classList.contains("pill")) {
      chartTraffic(el.dataset.type);
    }
    if (el.tagName === "BUTTON" && el.classList.contains("save")) {
      saveSettings();
    }
    if (el.tagName === "BUTTON" && el.classList.contains("cancel")) {
      clearSettings();
    }
  });

  $(".notifications .bell").addEventListener("click", (e) => {
    $(".notifications .dropdown").classList.toggle("show");
  });

  initCharts();
  initForm();
  loadSettings();
});

const charts = {
  traffic: null,
  dailyTraffic: null,
  mobileUsers: null,
};

function initCharts() {
  chartTraffic();
  chartDailyTraffic();
  chartMobileUsers();
}

function rnd(min, max) {
  return Math.floor(Math.random() * max + min);
}

const trafficTypes = {
  hourly: [
    { x: "16-22", count: rnd(500, 2500) },
    { x: "23-29", count: rnd(500, 2500) },
    { x: "30-5", count: rnd(500, 2500) },
    { x: "6-12", count: rnd(500, 2500) },
    { x: "13-19", count: rnd(500, 2500) },
    { x: "20-26", count: rnd(500, 2500) },
    { x: "27-3", count: rnd(500, 2500) },
    { x: "4-10", count: rnd(500, 2500) },
    { x: "11-17", count: rnd(500, 2500) },
    { x: "18-24", count: rnd(500, 2500) },
    { x: "25-31", count: rnd(500, 2500) },
  ],
  daily: [
    { x: "S", count: rnd(0, 250) },
    { x: "M", count: rnd(0, 250) },
    { x: "T", count: rnd(0, 250) },
    { x: "W", count: rnd(0, 250) },
    { x: "T", count: rnd(0, 250) },
    { x: "F", count: rnd(0, 250) },
    { x: "S", count: rnd(0, 250) },
  ],
  weekly: Array.from({ length: 52 }, (_, i) => i + 1).map((i) => {
    return { x: i, count: rnd(100, 5000) };
  }),
  monthly: [
    { x: "Jan", count: rnd(2500, 25000) },
    { x: "Feb", count: rnd(2500, 25000) },
    { x: "Mar", count: rnd(2500, 25000) },
    { x: "Apr", count: rnd(2500, 25000) },
    { x: "Jun", count: rnd(2500, 25000) },
    { x: "Jul", count: rnd(2500, 25000) },
    { x: "Aug", count: rnd(2500, 25000) },
    { x: "Sep", count: rnd(2500, 25000) },
    { x: "Oct", count: rnd(2500, 25000) },
    { x: "Nov", count: rnd(2500, 25000) },
    { x: "Dec", count: rnd(2500, 25000) },
  ],
};

function chartTraffic(trafficType) {
  charts.traffic?.destroy();
  trafficType = trafficType || localStorage.trafficType || "hourly";

  const data = trafficTypes[trafficType];

  charts.traffic = new Chart($("#chart-traffic"), {
    type: "line",
    data: {
      labels: data.map((row) => row.x),
      datasets: [
        {
          label: "Visits",
          data: data.map((row) => row.count),
          tension: 0.4,
          borderColor: "rgba(117, 119, 186, .7)",
          backgroundColor: "rgba(117, 119, 186, .3)",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    },
  });

  $(".pill.active")?.classList.remove("active");
  $(`.pill[data-type="${trafficType}"]`).classList.add("active");
  localStorage.trafficType = trafficType;
}

function chartDailyTraffic() {
  const data = trafficTypes["daily"];

  charts.dailyTraffic = new Chart($("#chart-daily-traffic"), {
    type: "bar",
    data: {
      labels: data.map((row) => row.x),
      datasets: [
        {
          label: "Visits",
          data: data.map((row) => row.count),
          backgroundColor: "rgba(117, 119, 186, 1)",
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

function chartMobileUsers() {
  const data = [
    { type: "Desktop", count: rnd(0, 1000) },
    { type: "Tablet", count: rnd(0, 1000) },
    { type: "Phones", count: rnd(0, 1000) },
  ];

  charts.mobileUsers = new Chart($("#chart-mobile-users"), {
    type: "doughnut",
    data: {
      labels: data.map((row) => row.type),
      datasets: [
        {
          label: "",
          data: data.map((row) => row.count),
          backgroundColor: [
            "rgba(117, 119, 186, 1)",
            "rgba(145, 199, 148, 1)",
            "rgba(108, 180, 197, 1",
          ],
          borderColor: [
            "rgba(117, 119, 186, 1)",
            "rgba(145, 199, 148, 1)",
            "rgba(108, 180, 197, 1",
          ],
        },
      ],
    },
    options: {
      radius: "80%",
      responsive: true,
      plugins: {
        legend: {
          position: "right",
        },
      },
    },
  });
}

// prevents a function from being called too frequently
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const debouncedHandleResize = debounce(() => handleResize());
window.addEventListener("resize", debouncedHandleResize);

function handleResize() {
  charts.traffic?.destroy();
  charts.dailyTraffic?.destroy();
  charts.mobileUsers?.destroy();
  initCharts();
}

function initForm() {
  $("#message-form").addEventListener("submit", (e) => {
    e.preventDefault();

    if (hasMessageErrors()) {
      return;
    } else {
      clearMessageErrors();
    }

    $("#message-alert").style.display = "block";
    e.target.reset();
  });
}

function hasMessageErrors() {
  clearMessageErrors();
  let hasError = false;
  if (!$("#message-form-user").value) {
    const error = $("#message-form-user + .error");
    error.textContent = "User cannot be blank";
    error.classList.add("show");
    hasError = true;
  }
  if (!$("#message-form-message").value) {
    const error = $("#message-form-message + .error");
    error.textContent = "Message cannot be blank";
    error.classList.add("show");
    hasError = true;
  }
  return hasError;
}

function clearMessageErrors() {
  $$("#message-form .error").forEach((el) => {
    el.classList.remove("show");
  });
}

function saveSettings() {
  localStorage["email-notifications"] = $("#email-notifications").checked;
  localStorage["profile-public"] = $("#profile-public").checked;
  localStorage["timezone"] = $("#timezone").value;
  $("#settings-alert span").textContent = "Settings saved";
  $("#settings-alert").style.display = "block";
}

function loadSettings() {
  $("#email-notifications").checked =
    localStorage["email-notifications"] === "true";
  $("#profile-public").checked = localStorage["profile-public"] === "true";
  $("#timezone").value = localStorage["timezone"];
}

function clearSettings() {
  localStorage.clear();
  $("#settings-alert span").textContent = "Settings cleared";
  $("#settings-alert").style.display = "block";
}
