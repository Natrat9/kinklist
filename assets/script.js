$(function () {
    let kinks = {};

    let addCssRule = (selector, rules) => {
        const sheet = document.styleSheets[0];
        if ("insertRule" in sheet) sheet.insertRule(`${selector} { ${rules} }`, 0);
        else if ("addRule" in sheet) sheet.addRule(selector, rules, 0);
    };

    function parseKinksText(kinksText) {
        const newKinks = {};
        const lines = kinksText.replace(/\r/g, "").split("\n");
        let catName = null;
        let cat = null;

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (line.startsWith("#")) {
                if (catName && cat) newKinks[catName] = cat;
                catName = line.substring(1).trim();
                cat = { kinks: [] };
            } 
            else if (line.startsWith("*") && cat) {
                cat.kinks.push(line.substring(1).trim());
            }
        }

        if (catName && cat) newKinks[catName] = cat;
        return newKinks;
    }

    function fillInputList() {
        $("#InputList").empty();
        
        Object.keys(kinks).forEach(catName => {
            const category = kinks[catName];
            const $catDiv = $("<div>").addClass("kinkCategory")
                .append($("<h2>").text(catName));

            category.kinks.forEach(kink => {
                const $row = $("<div>").addClass("kinkRow");
                
                // Single colored button like the image
                const $button = $("<span>")
                    .addClass("choice na") 
                    .attr("title", "Click to change color")
                    .css("cursor", "pointer");
                
                $row.append($button);
                $row.append($("<div>").addClass("kinkName").text(kink));
                
                $catDiv.append($row);
            });

            $("#InputList").append($catDiv);
        });
    }

    // Setup legend colors
    $(".legend .choice").each(function () {
        const color = $(this).data("color");
        const cls = this.className.replace("choice", "").trim();
        addCssRule(`.choice.${cls}`, `background-color: ${color};`);
    });

    // Click to cycle through colors
    $(document).on("click", ".choice", function () {
        const classes = ["na", "maybe", "okay", "like", "favorite", "try"];
        let current = 0;
        
        for (let i = 0; i < classes.length; i++) {
            if ($(this).hasClass(classes[i])) {
                current = i;
                break;
            }
        }
        
        $(this).removeClass(classes.join(" "));
        current = (current + 1) % classes.length;
        $(this).addClass(classes[current]);
    });

    // Initial load
    kinks = parseKinksText($("#Kinks").val().trim());
    fillInputList();

    // Edit button
    $("#Edit").on("click", () => $("#EditOverlay").fadeIn());

    $("#KinksOK").on("click", () => {
        kinks = parseKinksText($("#Kinks").val().trim());
        fillInputList();
        $("#EditOverlay").fadeOut();
    });

    // Close overlay
    $(".overlay").on("click", function (e) {
        if (e.target === this) $(this).fadeOut();
    });

    // Resize
    $(window).on("resize", fillInputList);
});
