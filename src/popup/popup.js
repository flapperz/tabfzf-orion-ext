document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const tabsList = document.getElementById("tabs-list");

  let selectIndex = 0;
  let isSelect = true;

  setTimeout(() => {
    searchInput.focus();
  }, 100);

  let tabs = [];
  let currentSearchTabId = [];
  const tabsLi = [];

  function createTabItems(tabs) {}

  function renderTabItems(tabs) {}

  chrome.tabs.query({}, (queriedTabs) => {
    tabs = queriedTabs;
    let titleText = "Open tabs:";
    document.getElementById("title").textContent =
      titleText + ` ${tabs.length}`;
    tabs.forEach((tab) => {
      const li = document.createElement("li");
      li.className = "tabItem-unfocus";

      const img = document.createElement("img");
      const favIconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${tab.url}`;
      // img.src = tab.favIconUrl ? tab.favIconUrl : "icons/globe-16x16.png";
      // img.src = "icons/globe-16x16.png";
      img.src = favIconUrl;
      img.alt = "Tab Icon";

      const span = document.createElement("span");
      span.textContent = tab.title;

      li.appendChild(img);
      li.appendChild(span);
      tabsList.appendChild(li);
      tabsLi.push(li);
    });

    currentSearchTabId = tabs.map((tab) => tab.id);
    if (tabsLi.length) tabsLi[0].className = "tabItem-focus";
  });

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const regex = new RegExp(searchTerm.split("").join(".*"), "i");

    currentSearchTabId = [];
    searchIndex = 0;
    for (var i = 0; i < tabsLi.length; i++) {
      const li = tabsLi[i];
      const tabtitle = li.children[1].textContent;

      if (regex.test(tabtitle.toLowerCase())) {
        li.style.display = "";
        currentSearchTabId.push(tabs[i].id);

        searchIndex++;
      } else {
        li.style.display = "none";
      }
    }
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (currentSearchTabId.length) {
        chrome.tabs.update(currentSearchTabId[selectIndex], { active: true });
      }
    }
  });

  // TODO: Select tab
  // TODO: VIM navigate key (Key chord ctrl+direction)
  // TODO: close tab button
  // TODO: highlight match like in VSCode
  // TODO: history
  // TODO: Click to goto
  // TODO: Use Fuse instead of REGEX
});
