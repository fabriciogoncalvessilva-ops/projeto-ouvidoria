document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    var adminMenuToggle = document.querySelector("[data-admin-menu-toggle]");
    var adminSidebar = document.querySelector("[data-admin-sidebar]");
    var adminBody = document.body;
    var adminPresenceUrl = adminBody ? adminBody.getAttribute("data-admin-presence-url") : "";
    var adminPresenceToken = adminBody ? adminBody.getAttribute("data-admin-presence-token") : "";

    if (menuToggle && menu) {
        var closeMenu = function () {
            if (!menu.classList.contains("is-open")) {
                return;
            }

            menu.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
        };

        menuToggle.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", function (event) {
            if (menu.contains(event.target) || menuToggle.contains(event.target)) {
                return;
            }

            closeMenu();
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeMenu();
            }
        });
    }

    if (adminMenuToggle && adminSidebar) {
        var closeSidebar = function () {
            if (!adminSidebar.classList.contains("is-open")) {
                return;
            }

            adminSidebar.classList.remove("is-open");
            adminMenuToggle.setAttribute("aria-expanded", "false");
        };

        adminMenuToggle.addEventListener("click", function () {
            var isOpen = adminSidebar.classList.toggle("is-open");
            adminMenuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        adminSidebar.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                if (window.innerWidth <= 1024) {
                    closeSidebar();
                }
            });
        });

        document.addEventListener("click", function (event) {
            if (adminSidebar.contains(event.target) || adminMenuToggle.contains(event.target)) {
                return;
            }

            closeSidebar();
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeSidebar();
            }
        });
    }

    if (adminPresenceUrl && adminPresenceToken) {
        var pingAdminPresence = function () {
            return fetch(adminPresenceUrl, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: "csrf_token=" + encodeURIComponent(adminPresenceToken)
            }).catch(function () {
                return null;
            });
        };

        pingAdminPresence();
        window.setInterval(pingAdminPresence, 60000);

        window.addEventListener("focus", pingAdminPresence);
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                pingAdminPresence();
            }
        });
    }

    var revealItems = document.querySelectorAll("[data-reveal]");

    if ("IntersectionObserver" in window && revealItems.length > 0) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        revealItems.forEach(function (item) {
            observer.observe(item);
        });
    } else {
        revealItems.forEach(function (item) {
            item.classList.add("is-visible");
        });
    }

    document.querySelectorAll("[data-confirm]").forEach(function (element) {
        element.addEventListener("click", function (event) {
            var message = element.getAttribute("data-confirm") || "Confirmar aÃ§Ã£o?";

            if (!window.confirm(message)) {
                event.preventDefault();
            }
        });
    });

    document.querySelectorAll("[data-dismiss-alert]").forEach(function (button) {
        button.addEventListener("click", function () {
            var alert = button.closest("[data-alert]");

            if (alert && alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        });
    });

    document.querySelectorAll("textarea[data-rich-editor]").forEach(function (textarea) {
        var toolbar = document.createElement("div");
        toolbar.className = "editor-toolbar";

        [
            { label: "B", before: "<strong>", after: "</strong>" },
            { label: "I", before: "<em>", after: "</em>" },
            { label: "H2", before: "<h2>", after: "</h2>" },
            { label: "Lista", before: "<ul><li>", after: "</li></ul>" }
        ].forEach(function (tool) {
            var button = document.createElement("button");
            button.type = "button";
            button.textContent = tool.label;
            button.addEventListener("click", function () {
                insertAroundSelection(textarea, tool.before, tool.after);
            });
            toolbar.appendChild(button);
        });

        var linkButton = document.createElement("button");
        linkButton.type = "button";
        linkButton.textContent = "Link";
        linkButton.addEventListener("click", function () {
            var url = window.prompt("Informe a URL do link:");

            if (!url) {
                return;
            }

            insertAroundSelection(textarea, '<a href="' + url + '">', "</a>");
        });
        toolbar.appendChild(linkButton);

        textarea.parentNode.insertBefore(toolbar, textarea);
    });
});

function insertAroundSelection(textarea, before, after) {
    var start = textarea.selectionStart || 0;
    var end = textarea.selectionEnd || 0;
    var value = textarea.value;
    var selected = value.slice(start, end);
    var replacement = before + selected + after;

    textarea.value = value.slice(0, start) + replacement + value.slice(end);
    textarea.focus();
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selected.length;
}
