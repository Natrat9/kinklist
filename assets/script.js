$(function () {
    // Utility functions
    let strToClass = (str) => {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, "");
    };

    let addCssRule = (selector, rules) => {
        const sheet = document.styleSheets[0];
        if ("insertRule" in sheet) sheet.insertRule(`${selector} { ${rules} }`, 0);
        else if ("addRule" in sheet) sheet.addRule(selector, rules, 0);
    };

    // Colors and levels
    let colors = {};
    let level = {};
    let kinks = {};

    // Parse the textarea into kinks object
    function parseKinksText(kinksText) {
        const newKinks = {};
        const lines = kinksText.replace(/\r/g, "").split("\n");
        let cat = null, catName = null;

        lines.forEach((line) => {
            if (!line.trim()) return;
            if (line[0] === "#") {
                if (catName) newKinks[catName] = cat;
                catName = line.substring(1).trim();
                cat = { fields: [], kinks: [] };
            } else if (line[0] === "(") {
                cat.fields = line.substring(1, line.length - 1).split(",").map(f => f.trim());
            } else if (line[0] === "*") {
                cat.kinks.push(line.substring(1).trim());
            }
        });

        if (catName) newKinks[catName] = cat;
        return newKinks;
    }

    // Create multi-column layout
    function createColumns() {
        $("#InputList").empty();
        let numCols = Math.floor((document.body.scrollWidth - 20) / 400);
        numCols = Math.max(1, Math.min(numCols, 4));
        let $columns = [];
        for (let i = 0; i < numCols; i++) {
            $columns.push($("<div>").addClass("col").appendTo("#InputList"));
        }
        return $columns;
    }

    // Generate a choice button container
    function createChoiceButtons() {
        const $container = $("<div>").addClass("choices");
        Object.keys(level).forEach(lvl => {
            $("<span>").addClass("choice " + level[lvl]).attr("title", lvl).appendTo($container);
        });
        return $container;
    }

    // Create a kink row
    function createKinkRow(kinkName, fields) {
        const $row = $("<div>").addClass("kinkRow");
        fields.forEach(field => {
            const $choices = createChoiceButtons();
            $choices.addClass("choice-" + strToClass(field));
            $row.append($("<div>").append($choices));
        });
        $row.append($("<div>").addClass("kinkName").text(kinkName));
        return $row;
    }

    // Fill the InputList with categories and kinks
    function fillInputList() {
        const $columns = createColumns();
        let colIndex = 0;

        Object.keys(kinks).forEach(catName => {
            const category = kinks[catName];
            const $catDiv = $("<div>").addClass("kinkCategory").append($("<h2>").text(catName));

            category.kinks.forEach(kink => {
                $catDiv.append(createKinkRow(kink, category.fields));
            });

            $columns[colIndex].append($catDiv);
            colIndex = (colIndex + 1) % $columns.length;
        });
    }

    // Setup legend colors
    $(".legend .choice").each(function () {
        const $choice = $(this);
        const text = $choice.parent().text().trim();
        const color = $choice.data("color");
        const cssClass = this.className.replace("choice", "").trim();
        addCssRule(`.choice.${cssClass}`, `background-color: ${color};`);
        colors[text] = color;
        level[text] = cssClass;
    });

    // Parse textarea and render kinklist
    kinks = parseKinksText($("#Kinks").val().trim());
    fillInputList();

    // Export URL button
    $("#Export").on("click", () => {
        const selections = $(".choice.selected").map((_, e) => e.title).toArray().join(",");
        $("#URL").val(window.location.href + "#" + selections);
    });

    // Edit textarea overlay
    $("#Edit").on("click", () => {
        $("#Kinks").val($("#Kinks").val().trim());
        $("#EditOverlay").fadeIn();
    });

    $("#KinksOK").on("click", () => {
        kinks = parseKinksText($("#Kinks").val().trim());
        fillInputList();
        $("#EditOverlay").fadeOut();
    });

    $(".overlay > *").on("click", e => e.stopPropagation());

    // Re-render on window resize
    $(window).on("resize", () => {
        fillInputList();
    });

    // Toggle choice selection
    $(document).on("click", ".choices .choice", function () {
        $(this).toggleClass("selected");
    });
});
