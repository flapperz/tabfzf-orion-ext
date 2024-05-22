document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const tabsList = document.getElementById("tabs-list");

  setTimeout(() => {
    searchInput.focus();
  }, 100);

  chrome.tabs.query({}, (tabs) => {
    let titleText = "Open v1 tabs:";
    document.getElementById("title").textContent =
      titleText + ` ${tabs.length}`;
    tabs.forEach((tab) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      const favIconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${tab.url}`;
      // img.src = tab.favIconUrl ? tab.favIconUrl : "icons/globe-16x16.png";
      // img.src = "icons/globe-16x16.png";
      img.src = favIconUrl;
      img.alt = "Tab Icon";

      const span = document.createElement("span");
      span.textContent = tab.title;

      li.className = "tabli";
      li.appendChild(img);
      li.appendChild(span);
      tabsList.appendChild(li);
    });
  });

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const regex = new RegExp(searchTerm.split("").join(".*"), "i");
    const items = tabsList.getElementsByTagName("li");
    for (var i = 0; i < items.length; i++) {
      const li = items[i];
      const tabtitle = li.children[1].textContent;

      if (regex.test(tabtitle.toLowerCase())) {
        li.style.display = "";
      } else {
        li.style.display = "none";
      }
    }
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const firstTab = tabsList.querySelector("li");
      if (firstTab) {
        const index = Array.prototype.indexOf.call(tabsList.children, firstTab);
        if (index >= 0) {
          chrome.tabs.update(tabs[index].id, { active: true });
        }
      }
    }
  });
});
