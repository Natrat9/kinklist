$(function () {
    let kinks = {};

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
            const $cat = $("<div>").addClass("kinkCategory")
                .append($("<h2>").text(catName));

            category.kinks.forEach(kink => {
                const $row = $("<div>").addClass("kinkRow").css({
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid #eee"
                });

                // Two buttons
                const $btn1 = $("<span>").addClass("choice na").css({cursor: "pointer", marginRight: "8px"});
                const $btn2 = $("<span>").addClass("choice na").css({cursor: "pointer"});

                const $textContainer = $("<div>").css("margin-left", "15px");
                $textContainer.append($("<div>").text(kink).css("font-weight", "500"));

                // Sub text logic
                let subText = "";
                const name = catName.toLowerCase();

                if (name.includes("clothing") || name.includes("roles") || name.includes("restrictive") || 
                    name.includes("domination") || name.includes("degradation") || name.includes("other") ||
                    name.includes("self") || name.includes("partner")) {
                    subText = "(Self, Partner)";
                } 
                else if (name.includes("general sex acts") || name.includes("pain") || 
                         name.includes("giving") || name.includes("touch")) {
                    subText = "(Giving, Receiving)";
                } 
                else if (name.includes("non-consent") || name.includes("actor")) {
                    subText = "(Actor, Target)";
                }

                if (subText) {
                    $textContainer.append($("<small>").text(subText).css({color: "#666", display: "block"}));
                }

                $row.append($btn1, $btn2, $textContainer);
                $cat.append($row);
            });

            $("#InputList").append($cat);
        });
    }

    // Cycle color on click
    $(document).on("click", ".choice", function () {
        const order = ["na", "maybe", "okay", "like", "favorite", "try"];
        let idx = order.findIndex(c => $(this).hasClass(c));
        $(this).removeClass(order.join(" "));
        $(this).addClass(order[(idx + 1) % order.length]);
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
});
