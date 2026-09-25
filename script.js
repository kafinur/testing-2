
// =============================================================
// PANCAPATH v10 - PETA BELAJAR ADAPTIF
// =============================================================

// Google Form A - Asesmen Awal (sudah diuji pengguna)
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc2q0LvcSfGEp4EEdIQ0JqkLgadHA-39Kfv3xaatbExpxvyFw/viewform";

const FORM_ENTRIES = {
  kelas: "entry.1906641876",
  nama: "entry.1732132169",
  kode: "entry.312168079",
  skor: "entry.2099821671",
  jalur: "entry.131691736",
  catatan: "entry.1496035943"
};


// Google Form B - Asesmen Akhir, Misi Bersama, dan Refleksi
const GOOGLE_FORM_B_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfEGgboZ1IQg8YMXTYCMXE6U6cmk_xESsViSebDKZ39RdFWzA/viewform";

const FORM_B_ENTRIES = {
  kelas: "entry.1903678857",
  nama: "entry.1481616423",
  kode: "entry.1786727890",
  skorAwal: "entry.572865688",
  jalur: "entry.1690887185",
  skorPancaQuest: "entry.717118100",
  badgePancaQuest: "entry.1724061796",
  c4: "entry.207178485",
  c5: "entry.1836426205",
  c6: "entry.132386902",
  perilakuMisi: "entry.1649171361",
  tindakanNyata: "entry.979605690",
  indikator: "entry.1262940320",
  pemahaman: "entry.1816522907",
  perilakuRefleksi: "entry.95877311",
  bantuan: "entry.9766113",
  helpfulness: "entry.1951446101",
  saran: "entry.326143243"
};

// Asesmen awal diadaptasi dari Lampiran 3 RPPM.
// Opsi mengoperasionalkan rubrik skor 1–4 agar dapat dihitung otomatis.
const questions = [
  {
    q: "Dari materi sebelumnya, mengapa aturan perlu sejalan dengan nilai Pancasila?",
    help: "Pilih jawaban yang paling tepat dan paling lengkap.",
    options: [
      ["Karena nilai Pancasila menjadi acuan agar aturan menghargai manusia dan kepentingan bersama.", 4],
      ["Karena aturan perlu sesuai nilai Pancasila agar dapat dijalankan secara adil dan bertanggung jawab.", 3],
      ["Karena Pancasila berkaitan dengan aturan yang berlaku di Indonesia.", 2],
      ["Saya belum dapat menjelaskan hubungan aturan dengan nilai Pancasila.", 1]
    ]
  },
  {
    q: "Aturan kelas meminta semua murid saling menghormati. Perilaku mana yang paling menunjukkan aturan itu dijalankan?",
    help: "Perhatikan tindakan konkret dan alasannya.",
    options: [
      ["Mendengarkan pendapat, tidak mengejek, dan memperlakukan teman secara adil karena setiap orang perlu dihargai.", 4],
      ["Mendengarkan pendapat teman dan tidak mengejeknya.", 3],
      ["Bersikap baik kepada teman selama kegiatan kelas.", 2],
      ["Saya belum dapat menentukan contoh perilakunya.", 1]
    ]
  },
  {
    q: "Apakah menyukai musik luar negeri otomatis bertentangan dengan Pancasila? Apa yang perlu diperhatikan untuk menilainya?",
    help: "Fokus pada perilaku dan dampaknya, bukan sekadar kesukaan.",
    options: [
      ["Tidak otomatis; yang perlu dinilai adalah perilaku dan dampaknya, termasuk apakah tetap menghargai orang lain dan budaya sendiri.", 4],
      ["Tidak otomatis; perlu melihat sikap dan perilaku orang tersebut dalam kehidupan sehari-hari.", 3],
      ["Bisa bertentangan jika seseorang terlalu menyukai budaya luar, tetapi saya belum dapat menjelaskan kriterianya.", 2],
      ["Ya, menyukai musik luar negeri otomatis bertentangan dengan Pancasila.", 1]
    ]
  }
];

let current = 0;
let answers = new Array(questions.length).fill(null);
let student = { nama: "", kelas: "", nomor: "", kode: "" };
let latestResult = null;
let selectedMissionBehavior = "";


const JOURNEY_STEPS = ["identity","initial","path","quest","mission","final","reflection","complete"];

function getJourneyState() {
  const hasStudent = !!localStorage.getItem("pancapath_student");
  const hasInitial = !!localStorage.getItem("pancapath_result");
  const hasPath = !!localStorage.getItem("pancapath_checkpoint_passed");
  const hasQuest = !!localStorage.getItem("pancapath_quest");
  const hasMission = !!localStorage.getItem("pancapath_mission");
  const hasFinal = !!localStorage.getItem("pancapath_final_assessment");
  const hasReflection = !!localStorage.getItem("pancapath_reflection");
  const hasComplete = localStorage.getItem("pancapath_completed") === "true";
  return { identity:hasStudent, initial:hasInitial, path:hasPath, quest:hasQuest, mission:hasMission, final:hasFinal, reflection:hasReflection, complete:hasComplete };
}

function updateJourneyProgress() {
  const state = getJourneyState();
  let firstIncompleteFound = false;

  JOURNEY_STEPS.forEach((step, index) => {
    const el = document.querySelector(`.progress-item[data-step="${step}"]`);
    if (!el) return;
    el.classList.remove("done","current");

    if (state[step]) {
      el.classList.add("done");
    } else if (!firstIncompleteFound) {
      el.classList.add("current");
      firstIncompleteFound = true;
    }

    const link = el.nextElementSibling;
    if (link && link.classList.contains("progress-link")) {
      link.classList.toggle("done", !!state[step]);
    }
  });

  if (state.complete) {
    document.querySelectorAll(".progress-item").forEach(el => {
      el.classList.remove("current");
      el.classList.add("done");
    });
    document.querySelectorAll(".progress-link").forEach(el => el.classList.add("done"));
  }
}

function showCompletion() {
  const result = JSON.parse(localStorage.getItem("pancapath_result") || "{}");
  const savedStudent = JSON.parse(localStorage.getItem("pancapath_student") || "{}");
  const route = result.score ? routeFromScore(Number(result.score)) : null;

  if ($("badgeName")) $("badgeName").textContent = savedStudent.nama || "—";
  if ($("badgeCode")) $("badgeCode").textContent = savedStudent.kode || "—";
  if ($("badgeRoute")) $("badgeRoute").textContent = route ? route.short : "—";
  const questResult = JSON.parse(localStorage.getItem("pancapath_quest") || "{}");
  if ($("badgeQuest")) $("badgeQuest").textContent = questResult.completed ? `${questResult.xp || 0}/100 XP` : "—";
  $("completionLocked")?.classList.add("hidden");
  $("completionCard")?.classList.remove("hidden");
  localStorage.setItem("pancapath_completed", "true");
  updateJourneyProgress();
}

function clearPancaPathProgress() {
  Object.keys(localStorage)
    .filter(k => k.startsWith("pancapath_"))
    .forEach(k => localStorage.removeItem(k));
}

const $ = (id) => document.getElementById(id);
const namaInput = $("namaInput");
const kelasSelect = $("kelasSelect");
const nomorSelect = $("nomorSelect");
const kodePreview = $("kodePreview");
const saveIdentityBtn = $("saveIdentityBtn");
const identityNote = $("identityNote");
const assessmentLocked = $("assessmentLocked");
const assessmentCard = $("assessmentCard");
const quizBox = $("quizBox");
const nextBtn = $("nextBtn");
const prevBtn = $("prevBtn");
const progressBar = $("progressBar");
const resultBox = $("resultBox");

function populateNumbers() {
  for (let i = 1; i <= 30; i++) {
    const opt = document.createElement("option");
    opt.value = String(i).padStart(2, "0");
    opt.textContent = String(i).padStart(2, "0");
    nomorSelect.appendChild(opt);
  }
}

function buildStudentCode() {
  const nama = namaInput.value.trim();
  const kelas = kelasSelect.value;
  const nomor = nomorSelect.value;

  if (!kelas || !nomor) {
    kodePreview.textContent = "—";
  } else {
    const huruf = kelas.replace("VIII ", "");
    kodePreview.textContent = `VIII-${huruf}-${nomor}`;
  }

  saveIdentityBtn.disabled = !(nama.length >= 2 && kelas && nomor);
}

namaInput.addEventListener("input", buildStudentCode);
kelasSelect.addEventListener("change", buildStudentCode);
nomorSelect.addEventListener("change", buildStudentCode);

saveIdentityBtn.addEventListener("click", () => {
  student = {
    nama: namaInput.value.trim(),
    kelas: kelasSelect.value,
    nomor: nomorSelect.value,
    kode: kodePreview.textContent
  };
  localStorage.setItem("pancapath_student", JSON.stringify(student));
  updateJourneyProgress();
  identityNote.textContent = `Identitas tersimpan: ${student.nama} • ${student.kode}`;
  assessmentLocked.classList.add("hidden");
  assessmentCard.classList.remove("hidden");
  $("asesmen").scrollIntoView({ behavior: "smooth" });
});

function renderQuestion() {
  const item = questions[current];
  progressBar.style.width = `${((current + 1) / questions.length) * 100}%`;
  quizBox.innerHTML = `
    <div class="question-num">Pertanyaan ${current + 1} dari ${questions.length}</div>
    <div class="question-title">${item.q}</div>
    <div class="question-help">${item.help}</div>
    <div class="options">
      ${item.options.map(opt => `
        <label class="option">
          <input type="radio" name="answer" value="${opt[1]}" ${answers[current] === opt[1] ? "checked" : ""}>
          <span>${opt[0]}</span>
        </label>`).join("")}
    </div>
  `;
  prevBtn.disabled = current === 0;
  nextBtn.textContent = current === questions.length - 1 ? "Lihat Hasil" : "Berikutnya";
  document.querySelectorAll('input[name="answer"]').forEach(radio => {
    radio.addEventListener("change", () => answers[current] = Number(radio.value));
  });
}

nextBtn.addEventListener("click", () => {
  if (answers[current] === null) {
    alert("Pilih satu jawaban terlebih dahulu.");
    return;
  }
  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    showResult();
  }
});

prevBtn.addEventListener("click", () => {
  if (current > 0) {
    current--;
    renderQuestion();
  }
});

function routeFromScore(score) {
  if (score <= 6) {
    return {
      id: "eksplorasi",
      label: "🟢 Jalur Eksplorasi – Kenali Nilainya",
      short: "Eksplorasi",
      desc: "Kamu akan memperoleh penguatan konsep, contoh konkret, dan bantuan bertahap."
    };
  }
  if (score <= 9) {
    return {
      id: "penguatan",
      label: "🔵 Jalur Penguatan – Analisis Masalahnya",
      short: "Penguatan",
      desc: "Kamu akan menguatkan alasan melalui pertanyaan penuntun dan analisis kasus."
    };
  }
  return {
    id: "tantangan",
    label: "🟣 Jalur Tantangan – Rancang Solusinya",
    short: "Tantangan",
    desc: "Kamu siap mengevaluasi alternatif dan merancang solusi yang dapat dipertanggungjawabkan."
  };
}

function showResult() {
  const score = answers.reduce((a, b) => a + b, 0);
  const route = routeFromScore(score);
  latestResult = { score, route };
  localStorage.setItem("pancapath_result", JSON.stringify({
    student,
    score,
    route: route.id
  }));
  updateJourneyProgress();

  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `
    <div class="question-num" style="color:#93c5fd">Hasil Cek Kesiapan</div>
    <h3>${route.label}</h3>
    <p>${route.desc}</p>
    <div class="result-summary">
      <div class="result-chip"><small>Nama</small><strong>${student.nama}</strong></div>
      <div class="result-chip"><small>Kode</small><strong>${student.kode}</strong></div>
      <div class="result-chip"><small>Kelas</small><strong>${student.kelas}</strong></div>
      <div class="result-chip"><small>Skor</small><strong>${score}/12</strong></div>
    </div>
    <div class="result-actions">
      <button class="btn primary" id="saveToFormBtn">Simpan Hasil ke Google Form</button>
      <button class="btn secondary-dark" id="startPathBtn">Mulai Jalur ${route.short}</button>
    </div>
    <p class="form-note">
      Saat tombol simpan ditekan, Google Form akan terbuka dengan data sudah terisi.
      Periksa lalu klik <strong>Kirim</strong>, kemudian kembali ke tab PancaPath.
    </p>
  `;

  $("saveToFormBtn").addEventListener("click", () => openPrefilledForm(score, route.label));
  $("startPathBtn").addEventListener("click", () => openPath(route.id, false));
  resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

function openPrefilledForm(score, jalur) {
  if (!student.kode) {
    alert("Identitas siswa belum tersimpan.");
    return;
  }
  const params = new URLSearchParams();
  params.append(FORM_ENTRIES.kelas, student.kelas);
  params.append(FORM_ENTRIES.nama, student.nama);
  params.append(FORM_ENTRIES.kode, student.kode);
  params.append(FORM_ENTRIES.skor, String(score));
  params.append(FORM_ENTRIES.jalur, jalur);
  params.append(FORM_ENTRIES.catatan, "Hasil asesmen dikirim melalui PancaPath v10");
  const url = `${GOOGLE_FORM_URL}?usp=pp_url&${params.toString()}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// =============================================================
// TIGA JALUR ADAPTIF
// =============================================================
const pathData = {
  eksplorasi: {
    label: "🟢 Jalur Eksplorasi",
    title: "Kenali Nilainya",
    intro: "Mulai dari konsep, contoh konkret, lalu gunakan bantuan bertahap untuk membangun alasan.",
    support: "Gunakan kalimat bantu: “Perilaku ... berkaitan dengan sila ... karena ...”.",
    stages: [
      {
        title: "1. Memahami konsep",
        text: "Pancasila sebagai kepribadian bangsa berarti nilai-nilai Pancasila tampak pada cara bangsa Indonesia berpikir, bersikap, memperlakukan orang lain, bekerja sama, dan mengambil keputusan."
      },
      {
        title: "2. Kenali contoh di sekolah",
        type: "values"
      },
      {
        title: "3. Latihan dengan scaffolding",
        text: "Situasi: kelompok memilih ketua dengan mendengarkan seluruh pendapat anggota. Tentukan perilaku, sila yang berkaitan, dan alasanmu.",
        work: [
          ["Perilaku yang saya lihat", "explore_behavior"],
          ["Sila / nilai yang berkaitan", "explore_value"],
          ["Alasan keterkaitan", "explore_reason"]
        ]
      }
    ],
    checkpoint: [
      {
        q: "Mendengarkan semua usulan sebelum menentukan keputusan kelas paling dekat dengan...",
        options: [
          ["Musyawarah dan menghargai pendapat", true],
          ["Mendahulukan kepentingan pribadi", false],
          ["Membiarkan satu orang menentukan semuanya", false]
        ]
      },
      {
        q: "Membagi kesempatan tampil secara seimbang paling mencerminkan...",
        options: [
          ["Keadilan dan keseimbangan hak–kewajiban", true],
          ["Kepentingan kelompok tertentu", false],
          ["Kebebasan tanpa tanggung jawab", false]
        ]
      },
      {
        q: "Kalimat alasan yang paling lengkap adalah...",
        options: [
          ["Perilaku mendengarkan teman terkait sila keempat karena keputusan bersama perlu ditempuh melalui musyawarah.", true],
          ["Perilaku itu baik karena semua orang menyukainya.", false],
          ["Perilaku itu termasuk Pancasila karena dilakukan di sekolah.", false]
        ]
      }
    ]
  },

  penguatan: {
    label: "🔵 Jalur Penguatan",
    title: "Analisis Masalahnya",
    intro: "Gunakan pertanyaan penuntun untuk membedakan kesukaan pribadi dari perilaku yang perlu dinilai berdasarkan Pancasila.",
    support: "Ingat: menyukai budaya luar tidak otomatis bertentangan dengan Pancasila. Periksa perilaku, alasan, dan dampaknya.",
    stages: [
      {
        title: "1. Stimulus",
        text: "Di kalangan remaja, budaya populer dari luar negeri banyak diminati. Dalam sebuah kelas, sebagian siswa menyukai musik Korea, tetapi muncul perilaku mengejek kesenian daerah dan menuduh semua penggemar budaya luar tidak cinta Indonesia."
      },
      {
        title: "2. Pertanyaan penuntun",
        text: "Analisis: perilaku mana yang sebenarnya bermasalah? nilai Pancasila apa yang belum diterapkan? siapa yang terdampak? bagaimana dampaknya bagi kerja sama kelas?"
      },
      {
        title: "3. Peta analisis",
        text: "Pilih satu perilaku dari kasus lalu tuliskan nilai, alasan, dan dampaknya.",
        work: [
          ["Perilaku yang dianalisis", "reinforce_behavior"],
          ["Nilai / sila yang berkaitan", "reinforce_value"],
          ["Alasan", "reinforce_reason"],
          ["Dampak bagi kelas", "reinforce_impact"]
        ]
      }
    ],
    checkpoint: [
      {
        q: "Apakah menyukai musik atau budaya luar otomatis menunjukkan hilangnya kepribadian Pancasila?",
        options: [
          ["Tidak; yang perlu dianalisis adalah perilaku, alasan, dan dampaknya.", true],
          ["Ya; budaya luar selalu bertentangan dengan Pancasila.", false],
          ["Ya, jika budaya itu populer di kalangan remaja.", false]
        ]
      },
      {
        q: "Dalam konflik pilihan pertunjukan kelas, tindakan yang paling sesuai adalah...",
        options: [
          ["Mendengar semua usulan, menilai alternatif, lalu menyepakati pilihan melalui musyawarah.", true],
          ["Memilih budaya paling populer tanpa diskusi.", false],
          ["Menyalahkan salah satu kelompok agar konflik cepat selesai.", false]
        ]
      },
      {
        q: "Kriteria yang tepat untuk membandingkan solusi adalah...",
        options: [
          ["Martabat manusia, persatuan, dan musyawarah.", true],
          ["Popularitas, kecepatan, dan jumlah pendukung.", false],
          ["Selera ketua, biaya, dan tren media sosial.", false]
        ]
      }
    ]
  },

  tantangan: {
    label: "🟣 Jalur Tantangan",
    title: "Rancang Solusinya",
    intro: "Uji alternatif, pilih solusi berdasarkan nilai Pancasila, lalu buat rencana tindakan yang keberhasilannya dapat diamati.",
    support: "Solusi yang kuat tidak hanya terdengar baik. Jelaskan manfaat, keterbatasan, pihak yang terlibat, dan tanda keberhasilannya.",
    stages: [
      {
        title: "1. Kasus PBL",
        text: "Sebuah kelas akan menampilkan pertunjukan. Sebagian siswa mengusulkan musik dan tarian Korea, sementara siswa lain mengusulkan kesenian daerah. Terjadi saling merendahkan pilihan budaya dan keputusan dibuat tanpa mendengarkan semua pihak. Sebagian siswa akhirnya enggan terlibat."
      },
      {
        title: "2. Evaluasi dua alternatif",
        text: "Buat dua cara penyelesaian yang berbeda. Bandingkan berdasarkan penghargaan martabat manusia, persatuan, dan musyawarah.",
        work: [
          ["Alternatif solusi 1", "challenge_solution1"],
          ["Manfaat / keterbatasan solusi 1", "challenge_eval1"],
          ["Alternatif solusi 2", "challenge_solution2"],
          ["Manfaat / keterbatasan solusi 2", "challenge_eval2"]
        ]
      },
      {
        title: "3. Rancang tindakan C6",
        text: "Pilih solusi yang lebih tepat lalu jabarkan tindakan, pelaksana, waktu, dan indikator keberhasilan.",
        work: [
          ["Tindakan", "challenge_action"],
          ["Pelaksana", "challenge_actor"],
          ["Waktu", "challenge_time"],
          ["Indikator keberhasilan yang dapat diamati", "challenge_indicator"]
        ]
      }
    ],
    checkpoint: [
      {
        q: "Solusi yang paling kuat adalah solusi yang...",
        options: [
          ["Menghargai pihak yang berbeda, menjaga persatuan, dan ditempuh melalui musyawarah.", true],
          ["Paling cepat dijalankan meskipun sebagian siswa tidak didengar.", false],
          ["Mengikuti pilihan kelompok terbesar tanpa mempertimbangkan kelompok lain.", false]
        ]
      },
      {
        q: "Indikator keberhasilan yang paling terukur adalah...",
        options: [
          ["Setiap kelompok memperoleh giliran menyampaikan usulan dan keputusan akhir disepakati bersama.", true],
          ["Kelas menjadi lebih baik.", false],
          ["Semua siswa menyukai budaya yang sama.", false]
        ]
      },
      {
        q: "Sebelum menetapkan solusi, langkah evaluatif yang penting adalah...",
        options: [
          ["Memeriksa apakah ada pihak yang dirugikan dan akibat yang belum dipikirkan.", true],
          ["Memastikan solusi sama dengan pilihan ketua.", false],
          ["Menghindari perubahan pendapat agar keputusan terlihat tegas.", false]
        ]
      }
    ]
  }
};

const valueCardsHtml = `
  <div class="value-cards">
    <div class="value-card">🙏<strong>Sila 1</strong>Menghormati keyakinan dan kesempatan beribadah.</div>
    <div class="value-card">🤝<strong>Sila 2</strong>Menghargai martabat manusia dan tidak mengejek.</div>
    <div class="value-card">🇮🇩<strong>Sila 3</strong>Menjaga persatuan dan bekerja sama.</div>
    <div class="value-card">🗣️<strong>Sila 4</strong>Mendengarkan usulan dan bermusyawarah.</div>
    <div class="value-card">⚖️<strong>Sila 5</strong>Membagi hak, tugas, dan kesempatan secara adil.</div>
  </div>
`;

function loadSavedWork(fieldId) {
  const saved = localStorage.getItem(`pancapath_work_${fieldId}`);
  return saved || "";
}

function saveWorkField(fieldId, value) {
  localStorage.setItem(`pancapath_work_${fieldId}`, value);
}

function openPath(id, preview = true) {
  const d = pathData[id];
  $("jalur").classList.add("hidden");
  const section = $("ruangBelajar");
  section.classList.remove("hidden");
  section.scrollIntoView({ behavior: "smooth" });

  const stagesHtml = d.stages.map(stage => {
    let inside = `<p>${stage.text || ""}</p>`;
    if (stage.type === "values") inside += valueCardsHtml;

    if (stage.work) {
      inside += `<div class="work-box">`;
      stage.work.forEach(([label, fieldId]) => {
        inside += `
          <label>${label}
            <textarea id="${fieldId}" data-work-field="${fieldId}" placeholder="Tuliskan jawabanmu...">${loadSavedWork(fieldId)}</textarea>
          </label>`;
      });
      inside += `</div>`;
    }

    return `<div class="stage-block"><h4>${stage.title}</h4>${inside}</div>`;
  }).join("");

  $("pathContent").innerHTML = `
    <div class="learning-shell">
      <aside class="learning-sidebar">
        <span class="badge">${d.label}</span>
        <h2>${d.title}</h2>
        <p>${d.intro}</p>
        <div class="support-box"><strong>💡 Dukungan belajar</strong><br>${d.support}</div>
        <div class="route-progress">
          <strong>Urutan:</strong><br>
          Memahami → Mengaplikasi → Checkpoint → Misi Bersama
        </div>
        ${preview ? `<p class="muted" style="font-size:.82rem;margin-top:16px">Mode pratinjau. Hanya jalur hasil asesmenmu yang dapat membuka Misi Bersama.</p>` : ""}
      </aside>

      <div class="learning-main">
        <span class="eyebrow">Ruang Belajar</span>
        <h2>${d.label} • ${d.title}</h2>
        ${stagesHtml}

        <div class="checkpoint" id="checkpointBox">
          <div class="checkpoint-head">
            <strong>🚩 Checkpoint Jalur</strong>
            <span class="checkpoint-score">Target: minimal 2/3 benar</span>
          </div>

          ${d.checkpoint.map((item, qi) => `
            <div class="check-q" data-check-index="${qi}">
              <strong>${qi + 1}. ${item.q}</strong>
              <div class="choice-row">
                ${item.options.map((opt, oi) => `
                  <button type="button" class="choice-btn"
                    data-question="${qi}"
                    data-option="${oi}"
                    data-correct="${opt[1]}">${opt[0]}</button>
                `).join("")}
              </div>
            </div>
          `).join("")}

          <div class="route-actions">
            <button type="button" class="btn primary" id="checkAnswersBtn">Periksa Checkpoint</button>
            <button type="button" class="btn secondary hidden" id="retryCheckpointBtn">Coba Lagi</button>
          </div>
          <div class="feedback" id="checkpointFeedback"></div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-work-field]").forEach(el => {
    el.addEventListener("input", () => saveWorkField(el.dataset.workField, el.value));
  });

  const selected = {};
  document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.question;
      selected[q] = btn;
      document.querySelectorAll(`.choice-btn[data-question="${q}"]`).forEach(x => x.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  $("checkAnswersBtn").addEventListener("click", () => {
    if (Object.keys(selected).length < 3) {
      $("checkpointFeedback").textContent = "Jawab ketiga pertanyaan checkpoint terlebih dahulu.";
      $("checkpointFeedback").style.color = "#b45309";
      return;
    }

    let score = 0;
    Object.values(selected).forEach(btn => {
      const correct = btn.dataset.correct === "true";
      btn.classList.add(correct ? "correct" : "wrong");
      if (correct) score++;
    });

    document.querySelectorAll(".choice-btn").forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.correct === "true") btn.classList.add("correct");
    });

    const actualRoute = latestResult?.route?.id ||
      JSON.parse(localStorage.getItem("pancapath_result") || "{}").route;

    if (score >= 2) {
      $("checkpointFeedback").innerHTML =
        `✅ Checkpoint tercapai: <strong>${score}/3</strong>. Kamu siap menuju Misi Bersama.`;
      $("checkpointFeedback").style.color = "#15803d";

      if (!preview && actualRoute === id) {
        localStorage.setItem("pancapath_checkpoint_passed", id);
        updateJourneyProgress();
        unlockQuest();
        $("checkpointFeedback").innerHTML +=
          `<br><button type="button" class="btn primary" id="goQuestBtn" style="margin-top:10px">🎮 Masuk ke PancaQuest</button>`;
        $("goQuestBtn").addEventListener("click", () => $("pancaQuest").scrollIntoView({ behavior: "smooth" }));
      } else {
        $("checkpointFeedback").innerHTML +=
          `<br><span style="font-size:.86rem">Ini pratinjau. PancaQuest terbuka setelah checkpoint pada jalur hasil asesmenmu.</span>`;
      }
    } else {
      $("checkpointFeedback").innerHTML =
        `🔎 Skor checkpoint <strong>${score}/3</strong>. Tinjau kembali materi dan bantuan belajar, lalu coba lagi.`;
      $("checkpointFeedback").style.color = "#b91c1c";
      $("retryCheckpointBtn").classList.remove("hidden");
    }
  });

  $("retryCheckpointBtn").addEventListener("click", () => openPath(id, preview));
}
window.openPath = openPath;

document.querySelectorAll("[data-open]").forEach(btn => {
  btn.addEventListener("click", () => openPath(btn.dataset.open, true));
});

$("closePath").addEventListener("click", () => {
  $("ruangBelajar").classList.add("hidden");
  $("jalur").classList.remove("hidden");
  $("jalur").scrollIntoView({ behavior: "smooth" });
});


// =============================================================
// SUMBER BELAJAR - VIDEO MODAL
// =============================================================
function openLearningVideo() {
  const modal = $("videoModal");
  const video = $("learningVideo");
  const source = video?.querySelector("source");
  if (source && !source.src) {
    source.src = source.dataset.src;
    video.load();
  }
  modal?.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeLearningVideo() {
  const modal = $("videoModal");
  const video = $("learningVideo");
  if (video) video.pause();
  modal?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

$("openVideoBtn")?.addEventListener("click", openLearningVideo);
$("closeVideoBtn")?.addEventListener("click", closeLearningVideo);
$("videoBackdrop")?.addEventListener("click", closeLearningVideo);

// =============================================================
// PANCAQUEST - MISI NILAI PANCASILA
// =============================================================
const QUEST_MISSIONS = [
  {
    id: "nilai",
    icon: "🕵️",
    title: "Misi 1 — Detektif Nilai",
    kicker: "TEMUKAN SILANYA",
    text: "Ketua kelompok mendengarkan semua pendapat sebelum keputusan diambil bersama.",
    prompt: "Nilai Pancasila manakah yang paling kuat terlihat?",
    choices: [
      ["Sila 1 — Ketuhanan", false],
      ["Sila 2 — Kemanusiaan", false],
      ["Sila 3 — Persatuan", false],
      ["Sila 4 — Kerakyatan / Musyawarah", true],
      ["Sila 5 — Keadilan Sosial", false]
    ],
    hint: "Cari kata kunci: mendengarkan pendapat dan keputusan bersama."
  },
  {
    id: "radar",
    icon: "📡",
    title: "Misi 2 — Radar Perilaku",
    kicker: "SCAN PERILAKU",
    text: "Nilai setiap perilaku. Yang dinilai bukan sekadar selera budaya, tetapi sikap dan dampaknya.",
    prompt: "Klasifikasikan tiga kartu berikut.",
    cards: [
      { text:"Menyukai musik Korea sambil tetap menghargai kesenian daerah.", answer:"sesuai" },
      { text:"Mengejek kesenian daerah sebagai kuno dan tidak layak ditampilkan.", answer:"tidak" },
      { text:"Menghargai teman yang memiliki selera budaya berbeda.", answer:"sesuai" }
    ],
    hint: "Kesukaan budaya tidak otomatis salah. Fokus pada sikap menghargai, persatuan, dan tanggung jawab."
  },
  {
    id: "solusi",
    icon: "🧩",
    title: "Misi 3 — Ruang Musyawarah",
    kicker: "PILIH SOLUSI",
    text: "Kelas berselisih memilih pertunjukan budaya lokal atau budaya Korea. Beberapa siswa mulai saling merendahkan.",
    prompt: "Pilih solusi yang paling sesuai nilai Pancasila.",
    choices: [
      ["Ketua memilih sendiri agar cepat selesai.", false],
      ["Kelompok terbanyak menentukan dan kelompok lain harus menerima.", false],
      ["Semua usulan didengar, dibandingkan berdasarkan alasan, lalu diputuskan melalui musyawarah.", true]
    ],
    hint: "Solusi terbaik perlu menjaga martabat, persatuan, dan musyawarah."
  },
  {
    id: "aksi",
    icon: "🛠️",
    title: "Misi 4 — Builder Aksi",
    kicker: "RANCANG AKSIMU",
    text: "Sekarang ubah nilai menjadi tindakan yang bisa benar-benar dilakukan di kelas.",
    prompt: "Lengkapi empat bagian. Semua bagian harus konkret dan dapat diamati.",
    hint: "Gunakan rumus: tindakan + siapa + kapan + tanda berhasil."
  }
];

let questState = {
  mission: 0,
  xp: 0,
  streak: 0,
  answered: {},
  hintUsed: false
};

function getQuestRoute() {
  const r = latestResult?.route?.id || JSON.parse(localStorage.getItem("pancapath_result") || "{}").route;
  return r || "eksplorasi";
}

function questRouteMeta(routeId) {
  const map = {
    eksplorasi: {
      label:"🟢 Eksplorasi",
      intro:"Kamu mendapat bantuan lebih jelas. Gunakan petunjuk bila diperlukan.",
      hint:"Petunjuk tersedia tanpa penalti."
    },
    penguatan: {
      label:"🔵 Penguatan",
      intro:"Gunakan alasanmu sebelum membuka petunjuk.",
      hint:"Petunjuk tersedia bila kamu benar-benar membutuhkannya."
    },
    tantangan: {
      label:"🟣 Tantangan",
      intro:"Coba selesaikan secara mandiri. Petunjuk tetap ada sebagai jaring pengaman.",
      hint:"Tantang dirimu untuk menyelesaikan tanpa petunjuk."
    }
  };
  return map[routeId] || map.eksplorasi;
}

function unlockQuest() {
  $("questLocked")?.classList.add("hidden");
  $("adventureLaunch")?.classList.remove("hidden");
  $("questArena")?.classList.add("hidden");
  prepareQuestPlayer();
}

function startClassicQuest() {
  $("adventureLaunch")?.classList.add("hidden");
  $("questArena")?.classList.remove("hidden");
  prepareQuestPlayer();
  renderQuestMission();
}

function startAdventureQuest() {
  const savedStudent = JSON.parse(localStorage.getItem("pancapath_student") || "{}");
  const savedResult = JSON.parse(localStorage.getItem("pancapath_result") || "{}");
  const route = savedResult.route || getQuestRoute();
  const params = new URLSearchParams({
    name: savedStudent.nama || "PancaPath Explorer",
    code: savedStudent.kode || "",
    route: route || "eksplorasi",
    return: "../index.html#pancaQuest"
  });
  window.location.href = `game/index.html?${params.toString()}`;
}

$("startAdventureBtn")?.addEventListener("click", startAdventureQuest);
$("startClassicQuestBtn")?.addEventListener("click", startClassicQuest);

function prepareQuestPlayer() {
  const savedStudent = JSON.parse(localStorage.getItem("pancapath_student") || "{}");
  const route = getQuestRoute();
  const meta = questRouteMeta(route);
  if ($("questPlayer")) $("questPlayer").textContent = savedStudent.nama || "PancaPath Explorer";
  if ($("questRouteLabel")) $("questRouteLabel").textContent = meta.label;
  if ($("questTip")) $("questTip").textContent = `💡 ${meta.intro}`;
}

function updateQuestHUD() {
  if ($("questXp")) $("questXp").textContent = questState.xp;
  if ($("questMissionNo")) $("questMissionNo").textContent = Math.min(questState.mission + 1, 4);
  if ($("questStreak")) $("questStreak").textContent = questState.streak;
  if ($("questXpBar")) $("questXpBar").style.width = `${Math.min(100, questState.xp)}%`;
}

function questFeedback(message, type="good") {
  const el = $("questFeedback");
  if (!el) return;
  el.className = `quest-feedback ${type}`;
  el.innerHTML = message;
}

function fireConfetti(count=34) {
  const layer = $("confettiLayer");
  if (!layer) return;
  const icons = ["◆","●","★","✦","■"];
  for (let i=0; i<count; i++) {
    const p = document.createElement("span");
    p.className = "confetti-piece";
    p.textContent = icons[Math.floor(Math.random()*icons.length)];
    p.style.left = `${Math.random()*100}%`;
    p.style.animationDelay = `${Math.random()*.35}s`;
    p.style.animationDuration = `${1.7 + Math.random()*1.3}s`;
    p.style.setProperty("--drift", `${-80 + Math.random()*160}px`);
    layer.appendChild(p);
    setTimeout(() => p.remove(), 3300);
  }
}

function addQuestXp(amount, correct=true) {
  questState.xp = Math.min(100, questState.xp + amount);
  if (correct) questState.streak += 1;
  else questState.streak = 0;
  updateQuestHUD();
}

function renderQuestMission() {
  const stage = $("questStage");
  if (!stage) return;
  const m = QUEST_MISSIONS[questState.mission];
  questState.hintUsed = false;
  $("questHintBtn")?.classList.remove("used");
  $("questHintBtn").textContent = "✨ Gunakan Petunjuk";
  updateQuestHUD();

  let body = "";
  if (m.choices) {
    body = `
      <div class="quest-choice-grid">
        ${m.choices.map((c, i) => `
          <button type="button" class="quest-choice" data-quest-choice="${i}" data-correct="${c[1]}">
            <span class="choice-key">${String.fromCharCode(65+i)}</span>
            <span>${c[0]}</span>
          </button>`).join("")}
      </div>`;
  } else if (m.cards) {
    body = `
      <div class="radar-cards">
        ${m.cards.map((c,i) => `
          <div class="radar-card" data-radar-card="${i}">
            <div class="radar-scan"></div>
            <p>${c.text}</p>
            <div class="radar-actions">
              <button type="button" data-radar-answer="sesuai" data-card="${i}">✅ Sesuai</button>
              <button type="button" data-radar-answer="tidak" data-card="${i}">❌ Tidak sesuai</button>
            </div>
          </div>`).join("")}
      </div>`;
  } else {
    body = `
      <div class="action-builder">
        <label>Tindakan<textarea id="questAction" placeholder="Apa tindakan konkretnya?"></textarea></label>
        <label>Pelaksana<input id="questActor" type="text" placeholder="Siapa yang melakukan?" /></label>
        <label>Waktu<input id="questTime" type="text" placeholder="Kapan dilakukan?" /></label>
        <label>Indikator keberhasilan<textarea id="questIndicator" placeholder="Apa tanda yang dapat diamati?"></textarea></label>
        <button type="button" class="btn quest-submit-action" id="questActionBtn">⚡ Aktifkan Rencana</button>
      </div>`;
  }

  stage.innerHTML = `
    <div class="quest-mission-card quest-enter">
      <div class="quest-mission-icon">${m.icon}</div>
      <span class="quest-kicker">${m.kicker}</span>
      <h3>${m.title}</h3>
      <p class="quest-story">${m.text}</p>
      <div class="quest-prompt">${m.prompt}</div>
      ${body}
      <div id="questFeedback" class="quest-feedback"></div>
    </div>`;

  bindQuestMissionEvents(m);
}

function bindQuestMissionEvents(m) {
  if (m.choices) {
    document.querySelectorAll("[data-quest-choice]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (document.querySelector(".quest-choice.locked")) return;
        const correct = btn.dataset.correct === "true";
        document.querySelectorAll(".quest-choice").forEach(x => x.classList.add("locked"));
        if (correct) {
          btn.classList.add("quest-correct");
          addQuestXp(25, true);
          questFeedback("✅ Tepat! Alasanmu selaras dengan nilai Pancasila. +25 XP", "good");
          fireConfetti();
          setTimeout(nextQuestMission, 1150);
        } else {
          btn.classList.add("quest-wrong");
          document.querySelectorAll('.quest-choice[data-correct="true"]').forEach(x => x.classList.add("quest-correct"));
          addQuestXp(10, false);
          questFeedback("🔎 Belum paling tepat. Perhatikan kembali kriteria nilai Pancasila. Kamu tetap mendapat +10 XP karena sudah mencoba.", "retry");
          setTimeout(nextQuestMission, 1500);
        }
      });
    });
  }

  if (m.cards) {
    const responses = {};
    document.querySelectorAll("[data-radar-answer]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.card);
        if (responses[idx] !== undefined) return;
        const answer = btn.dataset.radarAnswer;
        const card = m.cards[idx];
        const correct = answer === card.answer;
        responses[idx] = correct;
        const cardEl = document.querySelector(`[data-radar-card="${idx}"]`);
        cardEl?.classList.add(correct ? "radar-correct" : "radar-wrong");
        cardEl?.querySelectorAll("button").forEach(b => b.disabled = true);

        if (Object.keys(responses).length === m.cards.length) {
          const correctCount = Object.values(responses).filter(Boolean).length;
          const xp = correctCount === 3 ? 25 : correctCount === 2 ? 18 : 10;
          addQuestXp(xp, correctCount >= 2);
          questFeedback(`${correctCount === 3 ? "✅ Radar sempurna!" : "📡 Scan selesai."} ${correctCount}/3 klasifikasi tepat. +${xp} XP`, correctCount >= 2 ? "good" : "retry");
          if (correctCount === 3) fireConfetti(40);
          setTimeout(nextQuestMission, 1500);
        }
      });
    });
  }

  $("questActionBtn")?.addEventListener("click", () => {
    const data = {
      action: $("questAction")?.value.trim(),
      actor: $("questActor")?.value.trim(),
      time: $("questTime")?.value.trim(),
      indicator: $("questIndicator")?.value.trim()
    };
    if (!data.action || !data.actor || !data.time || !data.indicator) {
      questFeedback("Lengkapi keempat bagian agar rencana aksimu dapat dijalankan.", "retry");
      document.querySelector(".action-builder")?.classList.add("quest-shake");
      setTimeout(() => document.querySelector(".action-builder")?.classList.remove("quest-shake"), 500);
      return;
    }
    localStorage.setItem("pancapath_quest_action", JSON.stringify(data));
    addQuestXp(25, true);
    questFeedback("🛠️ Rencana aktif! Tindakanmu sudah memiliki pelaksana, waktu, dan indikator keberhasilan. +25 XP", "good");
    fireConfetti(52);
    setTimeout(completeQuest, 1200);
  });
}

function nextQuestMission() {
  questState.mission += 1;
  if (questState.mission >= QUEST_MISSIONS.length) {
    completeQuest();
    return;
  }
  renderQuestMission();
}

function getQuestBadge(xp) {
  if (xp >= 90) return "🏅 Pancasila Pathfinder";
  if (xp >= 75) return "💡 Civic Problem Solver";
  if (xp >= 55) return "🔎 Value Detective";
  return "🌱 Pancasila Explorer";
}

function completeQuest() {
  questState.mission = 4;
  const savedStudent = JSON.parse(localStorage.getItem("pancapath_student") || "{}");
  const route = questRouteMeta(getQuestRoute());
  const result = {
    completed: true,
    xp: questState.xp,
    badge: getQuestBadge(questState.xp),
    route: getQuestRoute(),
    completed_at: new Date().toISOString()
  };
  localStorage.setItem("pancapath_quest", JSON.stringify(result));
  updateJourneyProgress();

  $("questArena")?.classList.add("hidden");
  $("adventureLaunch")?.classList.add("hidden");
  $("questLocked")?.classList.add("hidden");
  $("questComplete")?.classList.remove("hidden");
  if ($("questCompleteName")) $("questCompleteName").textContent = savedStudent.nama || "Pathfinder";
  if ($("questFinalXp")) $("questFinalXp").textContent = `${result.xp}/100`;
  if ($("questBadge")) $("questBadge").textContent = result.badge;
  if ($("questFinalRoute")) $("questFinalRoute").textContent = route.label;
  fireConfetti(80);
  unlockMission();
}

$("questHintBtn")?.addEventListener("click", () => {
  const m = QUEST_MISSIONS[questState.mission];
  if (!m) return;
  questState.hintUsed = true;
  $("questHintBtn").classList.add("used");
  $("questHintBtn").textContent = "💡 Petunjuk Aktif";
  $("questTip").textContent = `💡 ${m.hint}`;
});

$("questContinueBtn")?.addEventListener("click", () => {
  unlockMission();
  $("misiBersama").scrollIntoView({ behavior:"smooth" });
});

// =============================================================
// MISI BERSAMA
// =============================================================
function unlockMission() {
  $("missionLocked").classList.add("hidden");
  $("missionCard").classList.remove("hidden");
}

document.querySelectorAll(".behavior-choice").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".behavior-choice").forEach(x => x.classList.remove("selected"));
    btn.classList.add("selected");
    selectedMissionBehavior = btn.dataset.value;
  });
});

$("saveMissionBtn").addEventListener("click", () => {
  const action = $("missionAction").value.trim();
  const indicator = $("missionIndicator").value.trim();

  if (!selectedMissionBehavior || !action || !indicator) {
    $("missionNote").textContent = "Pilih perilaku dan lengkapi tindakan serta indikator keberhasilan.";
    $("missionNote").style.color = "#b45309";
    return;
  }

  const data = {
    nama: student.nama,
    kode: student.kode,
    behavior: selectedMissionBehavior,
    action,
    indicator,
    saved_at: new Date().toISOString()
  };
  localStorage.setItem("pancapath_mission", JSON.stringify(data));
  updateJourneyProgress();
  $("missionNote").textContent = "✅ Misi Bersama tersimpan. Asesmen akhir sudah terbuka.";
  $("missionNote").style.color = "#15803d";
  unlockFinalAssessment();
  setTimeout(() => $("asesmenAkhir").scrollIntoView({ behavior: "smooth" }), 500);
});

// =============================================================
// ASESMEN AKHIR
// =============================================================
function unlockFinalAssessment() {
  $("finalLocked").classList.add("hidden");
  $("finalAssessmentForm").classList.remove("hidden");
}

$("finalAssessmentForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    nama: student.nama,
    kode: student.kode,
    c4: $("finalC4").value.trim(),
    c5: $("finalC5").value.trim(),
    c6: $("finalC6").value.trim(),
    saved_at: new Date().toISOString()
  };
  localStorage.setItem("pancapath_final_assessment", JSON.stringify(data));
  updateJourneyProgress();
  $("finalNote").textContent =
    "✅ Draf asesmen akhir tersimpan di perangkat. Pada tahap berikutnya data ini dapat dihubungkan ke Google Form B.";
  $("finalNote").style.color = "#15803d";
  setTimeout(() => $("refleksi").scrollIntoView({ behavior: "smooth" }), 500);
});

// =============================================================
// REFLEKSI
// =============================================================
$("reflectionForm").addEventListener("submit", e => {
  e.preventDefault();

  const helpfulness = $("helpfulness").value;
  if (!helpfulness) {
    $("saveNote").textContent = "Pilih penilaian 1–5 terlebih dahulu.";
    $("saveNote").style.color = "#b45309";
    return;
  }

  const data = {
    nama: student.nama,
    kode: student.kode,
    pemahaman: $("ref1").value.trim(),
    perilaku: $("ref2").value.trim(),
    bantuan: $("ref3").value.trim(),
    helpfulness,
    saran: $("suggestion").value.trim(),
    saved_at: new Date().toISOString()
  };

  localStorage.setItem("pancapath_reflection", JSON.stringify(data));
  updateJourneyProgress();
  $("saveNote").textContent =
    "✅ Refleksi tersimpan. Sekarang kirim hasil akhir ke Google Form B.";
  $("saveNote").style.color = "#15803d";
  $("formBAction").classList.remove("hidden");
});

function openPrefilledFormB() {
  const savedStudent = student.kode ? student : JSON.parse(localStorage.getItem("pancapath_student") || "{}");
  const savedResult = JSON.parse(localStorage.getItem("pancapath_result") || "{}");
  const quest = JSON.parse(localStorage.getItem("pancapath_quest") || "{}");
  const mission = JSON.parse(localStorage.getItem("pancapath_mission") || "{}");
  const finalData = JSON.parse(localStorage.getItem("pancapath_final_assessment") || "{}");
  const reflection = JSON.parse(localStorage.getItem("pancapath_reflection") || "{}");

  if (!savedStudent.nama || !savedStudent.kode || !savedResult.score ||
      !quest.completed || typeof quest.xp !== "number" || !quest.badge ||
      !mission.behavior || !finalData.c4 || !finalData.c5 || !finalData.c6 ||
      !reflection.pemahaman || !reflection.perilaku || !reflection.bantuan ||
      !reflection.helpfulness) {
    alert("Data akhir belum lengkap. Pastikan PancaQuest, Misi Bersama, asesmen akhir, dan refleksi sudah diselesaikan.");
    return;
  }

  const route = routeFromScore(Number(savedResult.score));

  const params = new URLSearchParams();
  params.append(FORM_B_ENTRIES.kelas, savedStudent.kelas);
  params.append(FORM_B_ENTRIES.nama, savedStudent.nama);
  params.append(FORM_B_ENTRIES.kode, savedStudent.kode);
  params.append(FORM_B_ENTRIES.skorAwal, String(savedResult.score));
  params.append(FORM_B_ENTRIES.jalur, route.label);
  params.append(FORM_B_ENTRIES.skorPancaQuest, String(quest.xp));
  params.append(FORM_B_ENTRIES.badgePancaQuest, quest.badge);
  params.append(FORM_B_ENTRIES.c4, finalData.c4);
  params.append(FORM_B_ENTRIES.c5, finalData.c5);
  params.append(FORM_B_ENTRIES.c6, finalData.c6);
  params.append(FORM_B_ENTRIES.perilakuMisi, mission.behavior);
  params.append(FORM_B_ENTRIES.tindakanNyata, mission.action);
  params.append(FORM_B_ENTRIES.indikator, mission.indicator);
  params.append(FORM_B_ENTRIES.pemahaman, reflection.pemahaman);
  params.append(FORM_B_ENTRIES.perilakuRefleksi, reflection.perilaku);
  params.append(FORM_B_ENTRIES.bantuan, reflection.bantuan);
  params.append(FORM_B_ENTRIES.helpfulness, String(reflection.helpfulness));
  if (reflection.saran) {
    params.append(FORM_B_ENTRIES.saran, reflection.saran);
  }

  const url = `${GOOGLE_FORM_B_URL}?usp=pp_url&${params.toString()}`;
  window.open(url, "_blank", "noopener,noreferrer");
  $("confirmFormBBtn").classList.remove("hidden");
  $("confirmFormBBtn").scrollIntoView({ behavior: "smooth", block: "center" });
}

$("sendFormBBtn").addEventListener("click", openPrefilledFormB);

$("confirmFormBBtn").addEventListener("click", () => {
  showCompletion();
  $("selesai").scrollIntoView({ behavior: "smooth" });
});

$("backHomeBtn").addEventListener("click", () => {
  $("beranda").scrollIntoView({ behavior: "smooth" });
});

$("newParticipantBtn").addEventListener("click", () => {
  const ok = confirm("Mulai peserta baru? Semua progres peserta pada perangkat ini akan dihapus.");
  if (!ok) return;
  clearPancaPathProgress();
  location.reload();
});

$("finishExitBtn").addEventListener("click", () => {
  const ok = confirm("Selesai dan keluar? Data sementara pada perangkat ini akan dihapus agar siap digunakan peserta berikutnya.");
  if (!ok) return;
  clearPancaPathProgress();
  alert("Progres perangkat sudah dibersihkan. PancaPath siap untuk peserta berikutnya.");
  location.reload();
});

// =============================================================
// PANCAQUEST ADVENTURE RETURN BRIDGE
// Mendukung GitHub Pages dan pengujian lokal via query parameter.
// =============================================================
function importAdventureReturn() {
  const qs = new URLSearchParams(window.location.search);
  if (!qs.has("quest_xp")) return;
  const xp = Math.max(0, Math.min(100, Number(qs.get("quest_xp")) || 0));
  const badge = qs.get("quest_badge") || getQuestBadge(xp);
  const route = qs.get("quest_route") || getQuestRoute();
  const result = {
    completed: true,
    xp,
    badge,
    route,
    source: "adventure",
    completed_at: new Date().toISOString()
  };
  localStorage.setItem("pancapath_quest", JSON.stringify(result));
  const actionRaw = qs.get("quest_action");
  if (actionRaw) {
    try { localStorage.setItem("pancapath_quest_action", actionRaw); } catch (e) {}
  }
  qs.delete("quest_xp"); qs.delete("quest_badge"); qs.delete("quest_route"); qs.delete("quest_action");
  const clean = window.location.pathname + (qs.toString() ? `?${qs}` : "") + "#pancaQuest";
  try { history.replaceState({}, "", clean); } catch (e) {}
}

// =============================================================
// RESTORE STATE
// =============================================================
function restoreState() {
  const savedStudent = localStorage.getItem("pancapath_student");
  if (savedStudent) {
    try {
      student = JSON.parse(savedStudent);
      namaInput.value = student.nama || "";
      kelasSelect.value = student.kelas;
      nomorSelect.value = student.nomor;
      kodePreview.textContent = student.kode;
      saveIdentityBtn.disabled = !(student.nama && student.kelas && student.nomor);
      identityNote.textContent = `Identitas tersimpan: ${student.nama} • ${student.kode}`;
      assessmentLocked.classList.add("hidden");
      assessmentCard.classList.remove("hidden");
    } catch (e) {}
  }

  const savedResult = localStorage.getItem("pancapath_result");
  if (savedResult) {
    try {
      const data = JSON.parse(savedResult);
      const route = routeFromScore(data.score);
      latestResult = { score: data.score, route };
    } catch (e) {}
  }

  const passed = localStorage.getItem("pancapath_checkpoint_passed");
  const resultRoute = latestResult?.route?.id;
  const savedQuest = localStorage.getItem("pancapath_quest");

  if (passed && resultRoute && passed === resultRoute && !savedQuest) {
    unlockQuest();
  }

  if (savedQuest) {
    try {
      const q = JSON.parse(savedQuest);
      if (q.completed) {
        const savedStudent2 = JSON.parse(localStorage.getItem("pancapath_student") || "{}");
        $("questLocked")?.classList.add("hidden");
        $("adventureLaunch")?.classList.add("hidden");
        $("questArena")?.classList.add("hidden");
        $("questComplete")?.classList.remove("hidden");
        if ($("questCompleteName")) $("questCompleteName").textContent = savedStudent2.nama || "Pathfinder";
        if ($("questFinalXp")) $("questFinalXp").textContent = `${q.xp || 0}/100`;
        if ($("questBadge")) $("questBadge").textContent = q.badge || getQuestBadge(q.xp || 0);
        if ($("questFinalRoute")) $("questFinalRoute").textContent = questRouteMeta(q.route || resultRoute).label;
        unlockMission();
      }
    } catch (e) {}
  }

  const mission = localStorage.getItem("pancapath_mission");
  if (mission) {
    try {
      const d = JSON.parse(mission);
      selectedMissionBehavior = d.behavior || "";
      $("missionAction").value = d.action || "";
      $("missionIndicator").value = d.indicator || "";
      document.querySelectorAll(".behavior-choice").forEach(btn => {
        if (btn.dataset.value === selectedMissionBehavior) btn.classList.add("selected");
      });
      unlockMission();
      unlockFinalAssessment();
    } catch (e) {}
  }

  const finalData = localStorage.getItem("pancapath_final_assessment");
  if (finalData) {
    try {
      const d = JSON.parse(finalData);
      $("finalC4").value = d.c4 || "";
      $("finalC5").value = d.c5 || "";
      $("finalC6").value = d.c6 || "";
      unlockFinalAssessment();
    } catch (e) {}
  }

  const savedRef = localStorage.getItem("pancapath_reflection");
  if (savedRef) {
    try {
      const d = JSON.parse(savedRef);
      $("ref1").value = d.pemahaman || "";
      $("ref2").value = d.perilaku || "";
      $("ref3").value = d.bantuan || "";
      $("helpfulness").value = d.helpfulness || "";
      $("suggestion").value = d.saran || "";
      if (d.pemahaman && d.perilaku && d.bantuan && d.helpfulness) {
        $("formBAction").classList.remove("hidden");
        $("confirmFormBBtn").classList.remove("hidden");
      }
    } catch (e) {}
  }

  if (localStorage.getItem("pancapath_completed") === "true") {
    showCompletion();
  }
  updateJourneyProgress();
}

// =============================================================
// MENU
// =============================================================
$("menuBtn").addEventListener("click", () => $("mainNav").classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a => {
  a.addEventListener("click", () => $("mainNav").classList.remove("open"));
});

populateNumbers();
importAdventureReturn();
restoreState();
renderQuestion();
updateJourneyProgress();
