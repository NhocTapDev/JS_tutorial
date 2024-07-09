/**
 * Render songs
 * Scroll top
 * Play/pause/seek
 * CD rotate
 * Next/prev
 * Ramdom
 * Next/repeat when ended
 * Active song
 * Scroll active song into view
 * Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "PLAYER";

const player = $(".player");
const playlist = $(".playlist");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  songs: [
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/listSong1/song1.mp3",
      image: "./assets/img/listSong1/song1.jpg",
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/listSong1/song2.mp3",
      image: "./assets/img/listSong1/song2.jpg",
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/listSong1/song3.mp3",
      image: "./assets/img/listSong1/song3.jpg",
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/listSong1/song11.mp3",
      image: "./assets/img/listSong1/song11.jpg",
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/listSong1/song5.mp3",
      image: "./assets/img/listSong1/song5.jpg",
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/listSong1/song6.mp3",
      image: "./assets/img/listSong1/song6.jpg",
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/listSong1/song7.mp3",
      image: "./assets/img/listSong1/song7.jpg",
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/listSong1/song8.mp3",
      image: "./assets/img/listSong1/song8.jpg",
    },
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "./assets/music/listSong1/song9.mp3",
      image: "./assets/img/listSong1/song9.jpg",
    },
  ],
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === app.currentIndex ? "active" : ""}" data-index="${index}">
            <div
              class="thumb"
              style="background-image: url('${song.image}')"
            ></div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
        </div>
      `;
    });
    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  hanleEvents: function () {
    // Xử lý CD quay
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10s/vòng
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý zoom CD
    const cdWidth = cd.offsetWidth;
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newcdWidth = cdWidth - scrollTop;
      cd.style.width = newcdWidth > 0 ? newcdWidth + "px" : 0;
      cd.style.opacity = newcdWidth / cdWidth;
    };

    // Xử lý play/pause
    playBtn.onclick = function () {
      if (app.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    // Khi song được play
    audio.onplay = function () {
      app.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };
    // Khi song được páue
    audio.onpause = function () {
      app.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
        progress.value = progressPercent;
      }
    };
    // Xử lý khi tua song
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
      audio.ontimeupdate(seekTime);
    };
    // Khi next song
    nextBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.nextSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    };
    // Khi prev song
    prevBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.prevSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    };
    // Xử lý random song
    randomBtn.onclick = function (e) {
      app.isRandom = !app.isRandom;
      randomBtn.classList.toggle("active", app.isRandom);
      app.setConfig("isRandom", app.isRandom);
    };
    // Xử lý repeat song
    repeatBtn.onclick = function (e) {
      app.isRepeat = !app.isRepeat;
      repeatBtn.classList.toggle("active", app.isRepeat);
      app.setConfig("isRepeat", app.isRepeat);
    };
    // Xử lý next song khi ended
    audio.onended = function () {
      if (app.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // Click song to play song
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song thì chuyển đến bài đó
        if (songNode) {
          app.currentIndex = +songNode.dataset.index;
          app.loadCurrentSong();
          app.render();
          audio.play();
        }
        if (e.target.closest(".option")) {
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Render playlist
    this.render();

    // Lắng nghe / xử lý các sự kiện
    this.hanleEvents();

    // Định nghĩa các thuộc tính cho project
    this.defineProperties();

    // Tải thông tin bái hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // Hiển thị trạng thái ban đầu của active
    repeatBtn.classList.toggle("active", app.isRepeat);
    repeatBtn.classList.toggle("active", app.isRandom);
  },
};

app.start();
