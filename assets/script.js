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
                cat = { fields: [], kinks: [] };
            } 
            else if (line.startsWith("(") && line.endsWith(")") && cat) {
                cat.fields = line.slice(1, -1).split(",").map(f => f.trim());
            } 
            else if (line.startsWith("*") && cat) {
                cat.kinks.push(line.substring(1).trim());
            }
        }

        if (catName && cat) newKinks[catName] = cat;
        return newKinks;
    }

    function createColumns() {
        $("#InputList").empty();
        let numCols = Math.floor((document.body.scrollWidth - 40) / 380);
        numCols = Math.max(1, Math.min(numCols, 4));

        let $columns = [];
        for (let i = 0; i < numCols; i++) {
            $columns.push($("<div>").addClass("col").appendTo("#InputList"));
        }
        return $columns;
    }

    function createChoiceButtons() {
        const $container = $("<div>").addClass("choices");
        $(".legend .choice").each(function () {
            const cls = this.className.replace("choice", "").trim();
            const title = $(this).parent().find(".legend-text").text().trim();
            $("<span>").addClass("choice " + cls).attr("title", title).appendTo($container);
        });
        return $container;
    }

    function createKinkRow(kinkName, fields) {
        const $row = $("<div>").addClass("kinkRow");
        fields.forEach(() => {
            $row.append($("<div>").append(createChoiceButtons()));
        });
        $row.append($("<div>").addClass("kinkName").text(kinkName));
        return $row;
    }

    function fillInputList() {
        const $columns = createColumns();
        let colIndex = 0;

        Object.keys(kinks).forEach(catName => {
            const category = kinks[catName];
            const $catDiv = $("<div>").addClass("kinkCategory")
                .append($("<h2>").text(catName));

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
    $("#Edit").on("click", () => {
        $("#EditOverlay").fadeIn();
    });

    $("#KinksOK").on("click", () => {
        kinks = parseKinksText($("#Kinks").val().trim());
        fillInputList();
        $("#EditOverlay").fadeOut();
    });

    // Close overlay when clicking outside
    $(".overlay").on("click", function (e) {
        if (e.target === this) $(this).fadeOut();
    });

    // Toggle selections
    $(document).on("click", ".choices .choice", function () {
        $(this).toggleClass("selected");
    });

    // Resize handler
    $(window).on("resize", () => {
        fillInputList();
    });
});
