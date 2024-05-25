// TODO: fix close tab bug
// TODO: highlight match like in VSCode
// TODO: history
// TODO: Click to goto
// TODO: Fuzzy Score
// TODO: Fix fuzzy and highlight

// ? VSCODE FUZZY https://stackoverflow.com/questions/49138685/which-algorithm-is-used-to-implement-search-for-files-in-visual-studio-code-go

document.addEventListener("DOMContentLoaded", () => {
  /** @type {HTMLInputElement} */
  const searchInput = document.querySelector("input#search-input");
  const tabsList = document.getElementById("tabs-list");
  const tabCount = document.getElementById("tab-count");

  let selectIndex = 0;
  let tabs = [];
  let currentSearchTabId = [];
  const tabsLi = [];

  setTimeout(() => {
    searchInput.focus();
  }, 100);

  function renderTabs(filteredTabs, searchTerm, highlightInTitle) {
    tabsList.innerHTML = "";

    filteredTabs.forEach((tab, index) => {
      const li = document.createElement("li");
      li.className =
        index === selectIndex ? "tabItem-focus" : "tabItem-unfocus";
      li.dataset.index = index;

      const img = document.createElement("img");
      const favIconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${tab.url}`;
      img.src = favIconUrl;
      img.alt = "Tab Icon";

      const tabContent = document.createElement("div");
      tabContent.className = "tab-content";

      const span = document.createElement("span");
      const highlightedTitle = highlightInTitle
        ? highlightText(tab.title, searchTerm)
        : tab.title;
      const highlightedUrl = !highlightInTitle
        ? highlightText(tab.url, searchTerm)
        : tab.url;
      span.innerHTML = `${highlightedTitle} <br><small>${highlightedUrl}</small>`;

      tabContent.appendChild(img);
      tabContent.appendChild(span);

      const closeButton = document.createElement("button");
      closeButton.innerHTML = "&times;";
      closeButton.className = "close-button";
      closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        chrome.tabs.remove(tab.id, () => {
          li.remove();
          tabs = tabs.filter((t) => t.id !== tab.id);
          renderTabs(tabs, searchTerm, highlightInTitle);
        });
      });

      li.appendChild(tabContent);
      li.appendChild(closeButton);
      tabsList.appendChild(li);
      tabsLi.push(li);
    });

    tabCount.textContent = `${
      filteredTabs.length == tabs.length ? "" : filteredTabs.length + " / "
    }${tabs.length} tabs`;
  }

  function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(searchTerm.split("").join(".*"), "i");
    const match = regex.exec(text);
    if (!match) return text;
    let highlightedText = "";
    let lastIndex = 0;
    match[0].split("").forEach((char, index) => {
      const startIndex = text
        .toLowerCase()
        .indexOf(char.toLowerCase(), lastIndex);
      highlightedText +=
        text.substring(lastIndex, startIndex) +
        `<span class="highlight">${text[startIndex]}</span>`;
      lastIndex = startIndex + 1;
    });
    highlightedText += text.substring(lastIndex);
    return highlightedText;
  }

  chrome.tabs.query({}, (queriedTabs) => {
    tabs = queriedTabs;
    renderTabs(tabs, "", true);

    currentSearchTabId = tabs.map((tab) => tab.id);
    if (tabsLi.length) tabsLi[0].className = "tabItem-focus";
  });

  function updateSelection() {
    tabsLi.forEach((li, index) => {
      li.className =
        index === selectIndex ? "tabItem-focus" : "tabItem-unfocus";
    });
    const selectedTab = tabsLi[selectIndex];
    if (selectedTab) {
      selectedTab.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const regex = new RegExp(searchTerm.split("").join(".*"), "i");

    currentSearchTabId = [];
    tabsLi.length = 0;

    let titleMatches = tabs.filter((tab) =>
      regex.test(tab.title.toLowerCase())
    );
    let urlMatches = tabs.filter(
      (tab) => !titleMatches.includes(tab) && regex.test(tab.url.toLowerCase())
    );

    let filteredTabs = [...titleMatches, ...urlMatches];
    filteredTabs.forEach((tab, index) => currentSearchTabId.push(tab.id));

    selectIndex = 0;
    renderTabs(
      filteredTabs,
      searchTerm,
      titleMatches.includes(filteredTabs[0])
    );
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (currentSearchTabId.length) {
        chrome.tabs.update(currentSearchTabId[selectIndex], { active: true });
      }
    } else if (
      event.key === "ArrowDown" ||
      (event.key === "j" && event.ctrlKey)
    ) {
      event.preventDefault();
      selectIndex = (selectIndex + 1) % currentSearchTabId.length;
      updateSelection();
    } else if (
      event.key === "ArrowUp" ||
      (event.key === "k" && event.ctrlKey)
    ) {
      event.preventDefault();
      selectIndex =
        (selectIndex - 1 + currentSearchTabId.length) %
        currentSearchTabId.length;
      updateSelection();
    }
  });
});
