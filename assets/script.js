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
        const $cat = $("<div>").addClass("kinkCategory").append($("<h2>").text(catName));
        
        category.kinks.forEach(kink => {
            const $row = $("<div>").addClass("kinkRow").css({
                display: "flex", 
                alignItems: "center", 
                padding: "10px 0", 
                borderBottom: "1px solid #eee"
            });
            
            const $btn1 = $("<span>").addClass("choice na").css({cursor: "pointer", marginRight: "8px"});
            const $btn2 = $("<span>").addClass("choice na").css({cursor: "pointer"});
            
            const $textContainer = $("<div>").css("margin-left", "15px");
            $textContainer.append($("<div>").text(kink).css("font-weight", "500"));
            
            // Better logic for subtext
            let subText = "";
            if (["Roles", "Clothing", "Restrictive", "Domination & Submission", "Degradation", "Other"].some(c => catName.includes(c))) {
                subText = "(Self, Partner)";
            } 
            else if (["General Sex Acts", "Pain", "Touch"].some(c => catName.includes(c))) {
                subText = "(Giving, Receiving)";
            } 
            else if (catName.includes("Non-Consent")) {
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
