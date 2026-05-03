$(function () {
    let kinks = {};

    let strToClass = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "");

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

    function createChoiceButtons() {
        const $container = $("<div>").addClass("choices");
        $(".legend .choice").each(function () {
            const cls = this.className.replace("choice", "").trim();
            const title = $(this).parent().find(".legend-text").text().trim();
            $("<span>")
                .addClass("choice " + cls)
                .attr("title", title)
                .appendTo($container);
        });
        return $container;
    }

    function fillInputList() {
        $("#InputList").empty();
        
        Object.keys(kinks).forEach(catName => {
            const category = kinks[catName];
            const $catDiv = $("<div>").addClass("kinkCategory")
                .append($("<h2>").text(catName));

            category.kinks.forEach(kink => {
                const $row = $("<div>").addClass("kinkRow");
                
                $row.append(createChoiceButtons());
                $row.append($("<div>").addClass("kinkName").text(kink));
                
                $catDiv.append($row);
            });

            $("#InputList").append($catDiv);
        });
    }

    // Setup legend colors
    $(".legend .choice").each(function () {
        const $choice = $(this);
        const color = $choice.data("color");
        const cssClass = this.className.replace("choice", "").trim();
        addCssRule(`.choice.${cssClass}`, `background-color: ${color};`);
    });

    // Initial load
    kinks = parseKinksText($("#Kinks").val().trim());
    fillInputList();

    // Export
    $("#Export").on("click", () => {
        const selections = $(".choice.selected").map((_, el) => $(el).attr("title")).get().join(",");
        $("#URL").val(window.location.href + "#" + selections);
    });

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

    // Toggle selection (only one per row)
    $(document).on("click", ".kinkRow .choice", function () {
        const $row = $(this).closest(".kinkRow");
        $row.find(".choice").removeClass("selected");
        $(this).addClass("selected");
    });

    // Resize
    $(window).on("resize", fillInputList);
});
    });
});
