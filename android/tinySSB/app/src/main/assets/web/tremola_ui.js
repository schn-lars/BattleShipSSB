// tremola_ui.js

"use strict";

var overlayIsActive = false;

var display_or_not = [
    'div:qr', 'div:back',
    'core', 'lst:chats', 'div:posts', 'lst:contacts', 'lst:members', 'the:connex',
    'lst:kanban', 'div:footer', 'div:textarea', 'div:confirm-members', 'plus',
    'div:settings', 'div:board', 'div:duels', 'battleships' // BATTLESHIP
];

var prev_scenario = 'chats';
var curr_scenario = 'chats';
var game_scenario = false;

var scenarioDisplay = {
    'chats': ['div:qr', 'core', 'lst:chats', 'div:footer'], // 'plus' TODO reactivate when encrypted chats are implemented
    'contacts': ['div:qr', 'core', 'lst:contacts', 'div:footer', 'plus'],
    'posts': ['div:back', 'core', 'div:posts', 'div:textarea'],
    'connex': ['div:qr', 'core', 'the:connex', 'div:footer', 'plus'],
    'members': ['div:back', 'core', 'lst:members', 'div:confirm-members'],
    'settings': ['div:back', 'div:settings', 'core'],
    'kanban': ['div:qr', 'core', 'lst:kanban', 'div:footer', 'plus'],
    'board': ['div:back', 'core', 'div:board'],
    'duels': ['div:back', 'core', 'div:duels'], // BATTLESHIP
    'battleships': ['div:back', 'battleships'] // BATTLESHIP
}

var scenarioMenu = {
    'chats': [['Connected Devices', 'menu_connection'], // '['New conversation', 'menu_new_conversation'],' TODO reactivate when encrypted chats are implemented
        ['Settings', 'menu_settings'],
        ['About', 'menu_about']],
    'contacts': [['New contact', 'menu_new_contact'],
        ['Connected Devices', 'menu_connection'],
        ['Settings', 'menu_settings'],
        ['About', 'menu_about']],
    'connex': [['New SSB pub', 'menu_new_pub'],
        ['Redeem invite code', 'menu_invite'],
        ['Connected Devices', 'menu_connection'],
        // ['<del>Force sync</del>', 'menu_sync'],
        ['Settings', 'menu_settings'],
        ['About', 'menu_about']],
    /*
      ['Redraw', 'menu_redraw'],
      ['Sync', 'menu_sync'],
      ['Redraw', 'menu_redraw'],
      ['Restream', 'menu_stream_all_posts'],
      ['Import ID', 'menu_import_id'],
      ['Process msgs', 'menu_process_msgs'],
      ['Add pub', 'menu_add_pub'],
      ['Dump', 'menu_dump'],
      ['Reset', 'menu_reset']]
    */
    'posts': [/* ['Take picture', 'menu_take_picture'],
                ['Pick image', 'menu_pick_image'], */
        ['Rename this chat', 'menu_edit_convname'],
        ['(un)Forget', 'menu_forget_conv'],
        ['Settings', 'menu_settings'],
        ['About', 'menu_about'], // BATTLESHIP ADDED
        ['Duels', 'show_duels']],
    'members': [['Settings', 'menu_settings'],
        ['About', 'menu_about']],

    'settings': [],

    'duels': [], // BATTLESHIP

    'battleships': [['Quit Game', 'quit_bsh']], // BATTLESHIP

    'kanban': [['New Kanban board', 'menu_new_board'],
        ['Invitations', 'menu_board_invitations'],
        ['Connected Devices', 'menu_connection'],
        ['Settings', 'menu_settings'],
        ['About', 'menu_about']],

    'board': [['Add list', 'menu_new_column'],
        ['Rename Kanban Board', 'menu_rename_board'],
        ['Invite Users', 'menu_invite'],
        ['History', 'menu_history'],
        ['Reload', 'reload_curr_board'],
        ['Leave', 'leave_curr_board'],
        ['(un)Forget', 'board_toggle_forget'],
        ['Debug', 'ui_debug']]
}

const QR_SCAN_TARGET = {
    ADD_CONTACT: 0,
    IMPORT_ID: 1
}

var curr_qr_scan_target = QR_SCAN_TARGET.ADD_CONTACT

function onBackPressed() {
    if (overlayIsActive) {
        closeOverlay();
        return;
    }
    if (['chats', 'contacts', 'connex', 'board'].indexOf(curr_scenario) >= 0) {
        if (curr_scenario == 'chats') {
            backend("onBackPressed");
        } else if (curr_scenario == 'board') {
            setScenario('kanban')
        } else if (curr_scenario == 'battleships') { // BATTLESHIP // TODO prev_scenario für duels unc posts und nicht in chat
            reset_battleship_mode()
            show_duels()
        } else {
            setScenario('chats')
        }
    } else {
        if (curr_scenario == 'settings') {
            document.getElementById('div:settings').style.display = 'none';
            document.getElementById('core').style.display = null;
            document.getElementById('div:footer').style.display = null;
        }
        setScenario(prev_scenario);
    }
}

function setScenario(s) {
    //console.log('setScenario ' + s)
    closeOverlay();
    var lst = scenarioDisplay[s];
    if (lst) {
        // if (s != 'posts' && curr_scenario != "members" && curr_scenario != 'posts') {
        if (['chats', 'contacts', 'connex', 'kanban'].indexOf(curr_scenario) >= 0) {
            var cl = document.getElementById('btn:' + curr_scenario).classList;
            cl.toggle('active', false);
            cl.toggle('passive', true);
        }
        // console.log(' l: ' + lst)
        display_or_not.forEach(function (d) {
            // console.log(' l+' + d);
            if (lst.indexOf(d) < 0) {
                document.getElementById(d).style.display = 'none';
            } else {
                document.getElementById(d).style.display = null;
                // console.log(' l=' + d);
            }
        })
        // console.log('s: ' + s)
        if (s != "board") {
            document.getElementById('tremolaTitle').style.position = null;
        }

        if (s == "posts" || s == "settings" || s == "board" || s == "duels" || s == 'battleships') {
            document.getElementById('tremolaTitle').style.display = 'none';
            document.getElementById('conversationTitle').style.display = null;
            // document.getElementById('plus').style.display = 'none';
        } else {
            document.getElementById('tremolaTitle').style.display = null;
            // if (s == "connex") { /* document.getElementById('plus').style.display = 'none'; */}
            // else { /* document.getElementById('plus').style.display = null; */}
            document.getElementById('conversationTitle').style.display = 'none';
        }
        if (lst.indexOf('div:qr') >= 0) {
            prev_scenario = s;
        }
        curr_scenario = s;
        if (['chats', 'contacts', 'connex', 'kanban'].indexOf(curr_scenario) >= 0) {
            var cl = document.getElementById('btn:' + curr_scenario).classList;
            cl.toggle('active', true);
            cl.toggle('passive', false);
        }
        if (s == 'board')
            document.getElementById('core').style.height = 'calc(100% - 60px)';
        else
            document.getElementById('core').style.height = 'calc(100% - 118px)';

        if (s == 'kanban') {
            var personalBoardAlreadyExists = false
            for (var b in tremola.board) {
                var board = tremola.board[b]
                if (board.flags.indexOf(FLAG.PERSONAL) >= 0 && board.members.length == 1 && board.members[0] == myId) {
                    personalBoardAlreadyExists = true
                    break
                }
            }
            if(!personalBoardAlreadyExists && display_create_personal_board) {
                menu_create_personal_board()
            }
        }
    }
}

function btnBridge(e) {
    var e = e.id, m = '';
    if (['btn:chats', 'btn:posts', 'btn:contacts', 'btn:connex', 'btn:kanban'].indexOf(e) >= 0) {
        setScenario(e.substring(4));
    }
    if (e == 'btn:menu') {
        if (scenarioMenu[curr_scenario].length == 0)
            return;
        document.getElementById("menu").style.display = 'initial';
        document.getElementById("overlay-trans").style.display = 'initial';
        scenarioMenu[curr_scenario].forEach(function (e) {
            m += "<button class=menu_item_button ";
            m += "onclick='" + e[1] + "();'>" + e[0] + "</button><br>";
        })
        m = m.substring(0, m.length - 4);
        // console.log(curr_scenario + ' menu! ' + m);
        document.getElementById("menu").innerHTML = m;
        return;
    }
    if (e == 'btn:attach') {
        if (scenarioMenu[curr_scenario].length == 0)
            return;
        backend('get:voice'); // + btoa(document.getElementById('draft').value));
        return;
    }

    // if (typeof Android != "undefined") { Android.onFrontendRequest(e); }
}

function menu_settings() {
    closeOverlay();
    setScenario('settings')
    document.getElementById("settings_urlInput").classList.remove("invalid")
    document.getElementById("settings_urlInput").value = tremola.settings["websocket_url"]
    if (tremola.settings["websocket"])
      document.getElementById("container:settings_ws_url").style.display = 'flex'
    /*
    prev_scenario = curr_scenario;
    curr_scenario = 'settings';
    document.getElementById('core').style.display = 'none';
    document.getElementById('div:footer').style.display = 'none';
    document.getElementById('div:settings').style.display = null;

    document.getElementById("tremolaTitle").style.display = 'none';
    */
    var c = document.getElementById("conversationTitle");
    c.style.display = null;
    c.innerHTML = "<div style='text-align: center;'><font size=+1><strong>Settings</strong></font></div>";
}

/*
*   This method displays the active/past duels.
*/
function show_duels() {
    setScenario('duels');
    var c = document.getElementById("conversationTitle");
    c.style.display = null;

    c.innerHTML = "<div style='text-align: center;'><font size=+2><strong>Duels</strong></font></div>";
    var container = document.getElementById("duels-container");
    container.innerHTML = "";

    console.log('show_duels ', JSON.stringify("gamelist before"));
    var gameListString = "";
//    var gameListString = "BSH ownerid1 participantid1 12 STOPPED"
    if (window.GamesHandler && typeof window.GamesHandler.createInstanceList === 'function') {
        gameListString = window.GamesHandler.createInstanceList();
        console.log('show_duels ', "gamelist received: ", gameListString);
    } else {
        console.error("GamesHandler.createInstanceList is not a function");
    }

    if (gameListString === "") {
        console.log('show_duels ', JSON.stringify("No active duels found."));
        var noDuelDiv = document.createElement("div");
        noDuelDiv.className = "no-duel-box";
        noDuelDiv.innerHTML = "No active duels available...";
        container.appendChild(noDuelDiv);
    } else {
        var gameList = gameListString.split('$');
        gameList.forEach(function(game) {
            var gameParts = game.split(" ");
            var gameName = gameParts[0];
            var ownerName = gameParts[1];
            //var ownerAlias = tremola.contacts[owner].alias;
            var participantName = gameParts[2];
            //var participantAlias = tremola.contacts[participant].alias;
            var startTimeRaw = parseInt(gameParts[3]);;
            // Format start time
            var date = new Date(startTimeRaw);
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            };
            var startTime = new Intl.DateTimeFormat('en-US', options).format(date);
            var state = gameParts[4];
            console.log('My Id: ', JSON.stringify(myId));
            var suffix = ".ed25519";
            if (ownerName == myId) {
                ownerName = "Me"
                participantName = id2b32(participantName);
            } else if (participantName == myId) {
                participantName = "Me";
                ownerName = id2b32(ownerName);
            } else {
                participantName = id2b32(participantName);
                ownerName = id2b32(ownerName);
            }
            var turn = gameList[5];
            var ships_rec_delivered = gameList[6];

            console.log('Game-Container for: ', JSON.stringify(name));

            var gameDiv = document.createElement("button");
            gameDiv.className = "duel-button";
            gameDiv.onclick = () => onDuelButtonClicked(game);

            // Change background color based on state
            if (state === 'STOPPED') {
                gameDiv.classList.add('duel-button-stopped');
            } else if (state === 'INVITED') {
                gameDiv.classList.add('duel-button-invited');
            } else if (state === 'RUNNING') {
                gameDiv.classList.add('duel-button-running');
            } else if (state === 'WAITING') {
                gameDiv.classList.add('duel-button-waiting');
            } else if (state === 'WON') {
                gameDiv.classList.add('duel-button-won');
            } else if (state === 'LOST') {
                gameDiv.classList.add('duel-button-lost');
            }
            // Create Icon for duel
            const img = document.createElement("img");
            if (gameName === "BSH") {
                img.src = "./img/battleship.svg";
            } else {
                // other game icons
                img.src = "./img/cancel.svg";
            }
            img.alt = `Duel Image`;
            img.className = "duel-image";
            gameDiv.appendChild(img);

            // Create text for duel button
            const span = document.createElement("span");
            span.className = "duel-text";
            span.innerHTML = `Owner: ${ownerName}<br>Participant: ${participantName}<br>Start Time: ${startTime}<br>State: ${state}`;

            gameDiv.appendChild(span);

            container.appendChild(gameDiv);
        });
    }
}

/**
*   Triggered when you click on an instance in duels overview.
*/
function onDuelButtonClicked(duelString) {
  console.log("Button clicked for: " + JSON.stringify(duelString));
  console.log("myId: ", JSON.stringify(myId));
  var duelList = duelString.split(" ");
  game = duelList[0]
  console.log("owner: ", JSON.stringify(duelList[1]));
  battleship_timestamp = duelList[3]
  battleship_status = duelList[4]
  switch (battleship_status) {
    case "STOPPED":
        return;
    case "INVITED":
        if (duelList[1] != myId) { // check if I am not the owner
            // I am not owner
            backend("games BSH INVACC " + duelList[1] + " " + myId); // nicht peerId
            // TODO possibly add cooldown
        } else {
            // TODO open game to see ships
            owner = duelList[1];
            peer = "-"
            battleships(null, duelList[6]);
        }
        return;
    case "WON": // 6 = shotsDeliverOutcome, 7 = shotsReceivedOutcome, 8 = ships
        owner = duelList[1];
        peer = duelList[2];
        battleships(null, duelList[6]);
        return;
    case "LOST":
        owner = duelList[1];
        peer = duelList[2];
        battleships(null, duelList[6]);
        return;
    case "WAITING":
        owner = duelList[1];
        peer = duelList[2];
        battleships(false, duelList[6]);
        return;
    case "RUNNING":
        owner = duelList[1];
        peer = duelList[2];
        if (duelList[5] == "0") {
            battleships(false, duelList[6]);
        } else {
            battleships(true, duelList[6]);
        }
        return;
    case "SPEC":
        owner = duelList[1];
        peer = duelList[2];
        battleships(null, duelList[6]);
        return;
    default:
        return;
  }
}


function closeOverlay() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('qr-overlay').style.display = 'none';
    document.getElementById('preview-overlay').style.display = 'none';
    document.getElementById('image-overlay').style.display = 'none';
    document.getElementById('new_chat-overlay').style.display = 'none';
    document.getElementById('new_contact-overlay').style.display = 'none';
    document.getElementById('confirm_contact-overlay').style.display = 'none';
    document.getElementById('overlay-bg').style.display = 'none';
    document.getElementById('overlay-trans').style.display = 'none';
    document.getElementById('overlay-bg-core').style.display = 'none';
    document.getElementById('overlay-trans-core').style.display = 'none';
    document.getElementById('about-overlay').style.display = 'none';
    document.getElementById('edit-overlay').style.display = 'none';
    document.getElementById('new_contact-overlay').style.display = 'none';
    document.getElementById('old_contact-overlay').style.display = 'none';
    document.getElementById('attach-menu').style.display = 'none';
    document.getElementById('div:modal_img').style.display = 'none';
    document.getElementById('connection-overlay').style.display = 'none';
    document.getElementById('import-id-overlay').style.display = 'none';

    // kanban overlays
    document.getElementById('div:menu_history').style.display = 'none';
    document.getElementById('div:item_menu').style.display = 'none';
    document.getElementById("kanban-invitations-overlay").style.display = 'none';
    document.getElementById('kanban-create-personal-board-overlay').style.display = 'none';
    curr_item = null
    close_board_context_menu()
    document.getElementById('btn:item_menu_description_save').style.display = 'none'
    document.getElementById('btn:item_menu_description_cancel').style.display = 'none'
    document.getElementById('div:debug').style.display = 'none'
    document.getElementById("div:invite_menu").style.display = 'none'

    overlayIsActive = false;

    if (curr_img_candidate != null) {
        backend('del:blob ' + curr_img_candidate);
        curr_img_candidate = null;
    }
}

function showPreview() {
    var draft = escapeHTML(document.getElementById('draft').value);
    if (draft.length == 0) return;
    if (!getSetting("enable_preview")) {
        new_text_post(draft);
        return;
    }
    var draft2 = draft.replace(/\n/g, "<br>\n");
    var to = recps2display(tremola.chats[curr_chat].members)
    document.getElementById('preview').innerHTML = "To: " + to + "<hr>" + draft2 + "&nbsp;<hr>";
    var s = document.getElementById('preview-overlay').style;
    s.display = 'initial';
    s.height = '80%'; // 0.8 * docHeight;
    document.getElementById('overlay-bg').style.display = 'initial';
    overlayIsActive = true;
}

function menu_about() {
    closeOverlay()
    document.getElementById('about-overlay').style.display = 'initial';
    document.getElementById('overlay-bg').style.display = 'initial';
    overlayIsActive = true;
}

function plus_button() {
    closeOverlay();
    if (curr_scenario == 'chats') {
        menu_new_conversation();
    } else if (curr_scenario == 'contacts') {
        menu_new_contact();
    } else if (curr_scenario == 'connex') {
        menu_new_pub();
    } else if (curr_scenario == 'kanban') {
        menu_new_board();
    }
}

function launch_snackbar(txt) {
    var sb = document.getElementById("snackbar");
    sb.innerHTML = txt;
    sb.className = "show";
    setTimeout(function () {
        sb.className = sb.className.replace("show", "");
    }, 3000);
}

// --- QR display and scan

function showQR() {
    generateQR('did:ssb:ed25519:' + myId.substring(1).split('.')[0])
}

function generateQR(s) {
    document.getElementById('qr-overlay').style.display = 'initial';
    document.getElementById('overlay-bg').style.display = 'initial';
    document.getElementById('qr-text').innerHTML = s;
    if (!qr) {
        var w, e, arg;
        w = window.getComputedStyle(document.getElementById('qr-overlay')).width;
        w = parseInt(w, 10);
        e = document.getElementById('qr-code');
        arg = {
            height: w,
            width: w,
            text: s,
            correctLevel: QRCode.CorrectLevel.M // L, M, Q, H
        };
        qr = new QRCode(e, arg);
    } else {
        qr.clear();
        qr.makeCode(s);
    }
    overlayIsActive = true;
}


function qr_scan_start(target) {
    // test if Android is defined ...
    curr_qr_scan_target = target
    backend("qrscan.init");
    closeOverlay();
}

function qr_scan_success(s) {
    closeOverlay();
    switch (curr_qr_scan_target) {
        case QR_SCAN_TARGET.ADD_CONTACT:
            var t = "did:ssb:ed25519:";
            if (s.substring(0, t.length) == t) {
                s = '@' + s.substring(t.length) + '.ed25519';
            }
            var b = '';
            try {
                b = atob(s.substr(1, s.length - 9));
                // FIXME we should also test whether it is a valid ed25519 public key ...
            } catch (err) {
            }
            if (b.length != 32) {
                launch_snackbar("unknown format or invalid identity");
                return;
            }
            new_contact_id = s;
            // console.log("tremola:", tremola)
            if (new_contact_id in tremola.contacts) {
                launch_snackbar("This contact already exists");
                return;
            }
            // FIXME: do sanity tests
            menu_edit('new_contact_alias', "Assign alias to new contact:<br>(only you can see this alias)", "");
            break
        case QR_SCAN_TARGET.IMPORT_ID:
            r = import_id(s)
            if (r) {
                launch_snackbar("Successfully imported, restarting...")
            } else {
                launch_snackbar("wrong format")
            }
            break
    }
}




function qr_scan_failure() {
    launch_snackbar("QR scan failed")
}

function qr_scan_confirmed() {
    var a = document.getElementById('alias_text').value;
    var s = document.getElementById('alias_id').innerHTML;
    // c = {alias: a, id: s};
    var i = (a + "?").substring(0, 1).toUpperCase()
    var c = {"alias": a, "initial": i, "color": colors[Math.floor(colors.length * Math.random())], "iam": "", "forgotten": false};
    tremola.contacts[s] = c;
    persist();
    backend("add:contact " + s + " " + btoa(a))
    load_contact_item([s, c]);
    closeOverlay();
}

function modal_img(img) {
    var modalImg = document.getElementById("modal_img");
    modalImg.src = img.data;
    var modal = document.getElementById('div:modal_img');
    modal.style.display = "block";
    overlayIsActive = true;
    let pz = new PinchZoom(modalImg,
        {
            onDoubleTap: function () {
                closeOverlay();
            }, maxZoom: 8
        }
    );
}

function menu_connection() {
    closeOverlay();
    //refresh_connection_progressbar()

    document.getElementById('connection-overlay-content').innerHTML = '';

    for (var peer in localPeers) {
        refresh_connection_entry(peer);
    }

    document.getElementById('overlay-bg').style.display = 'initial';
    document.getElementById('connection-overlay').style.display = 'initial';
    overlayIsActive = true;
}

function refresh_connection_entry(id) {
    var content = document.getElementById('connection-overlay-content')

    // only update existing entry
    if (document.getElementById('connection_' + id)) {
        if(id in localPeers) {
            var name = localPeers[id].alias != null ? localPeers[id].alias : localPeers[id].name
            if (name.length > 28)
                name = name.slice(0,27)
            document.getElementById('connection_name_' + id).innerHTML = name
            document.getElementById('connection_type_' + id).innerHTML = "via " + localPeers[id].type
            document.getElementById('connection_remaining_' + id).innerHTML = localPeers[id].remaining
        } else {
            document.getElementById('connection_' + id).outerHTML = ""
        }
        return
    }

    if(!(id in localPeers))
        return

    // create new entry

    var peer = localPeers[id]
    var name = localPeers[id].alias != null ? peer.alias : peer.name
    if (name.length > 28)
        name = name.slice(0,27)
    var remaining = peer.remaining != null ? peer.remaining : ""//"Remaining: "+ peer.remaining + " messages" : "Remaining messages unknown"
    var type = (peer.type != null) && (peer.type != "") ? peer.type : ""

    var entryHTML = "<div id='connection_" + id + "' class = 'connection_entry_container'>"
    entryHTML += "<div class='connection_entry_name_container'>"
    entryHTML += "<div id='connection_name_" + id + "' style='grid-area: name; margin-left: 5px; margin-top: 4px;font-size: 16px; font-weight: bold;white-space: nowrap;'>" + name + "</div>"
    entryHTML += "<div id='connection_type_" + id + "' style='grid-area: type; margin-left: 5px; font-size: 13px'>via " + type + "</div>"
    entryHTML += "</div>"
    entryHTML += "<div id='connection_remaining_" + id + "' style='grid-area: remaining;align-self: center; text-align: end; padding-right: 5px; '>" + remaining + "</div>"
    entryHTML += "</div>"

    document.getElementById('connection-overlay-content').innerHTML += entryHTML

}

function refresh_goset_progressbar(curr, max) {

    console.log("refresh_goset_progressbar", curr, max)

    var delta = max - curr

    document.getElementById('connection-overlay-progressbar-goset').value = (curr / max) * 100
    document.getElementById('connection-overlay-progressbar-label-goset').textContent = "GoSet - " + delta + " key" + (delta > 1 ? "s" : "") + " left"
    if (delta > 0) {
        console.log("display progress")
        document.getElementById('goset-progress-container').style.display = "initial"
        document.getElementById('progress-container').style.display = "none"
    } else {
        document.getElementById('goset-progress-container').style.display = "none"
        document.getElementById('progress-container').style.display = "initial"
    }

}

var max_chnks = 0
function refresh_chunk_progressbar(remaining) {

    if(remaining != 0) {
        max_chnks = Math.max(max_chnks, remaining)
    } else {
        max_chnks = 0 // reset
    }

    console.log("refresh_chunk_progressbar", remaining, max_chnks)


    if(remaining > 0) {
        var percentage = (1 - ((remaining - 0) / (max_chnks - 0))) * 100
        document.getElementById('connection-overlay-progressbar-chnk').value = percentage
        document.getElementById('connection-overlay-progressbar-label-chnk').textContent = remaining + " Chunks left"
    } else {
        document.getElementById('connection-overlay-progressbar-chnk').value = 100
        document.getElementById('connection-overlay-progressbar-label-chnk').textContent = "Chunks — Synchronized"
    }

}

function refresh_connection_progressbar(min_entries, old_min_entries, old_want_entries, curr_want_entries, max_entries) {

    console.log("min:", min_entries)
    console.log("old_min:", old_min_entries)
    console.log("old_curr:", old_want_entries)
    console.log("curr:", curr_want_entries)
    console.log("max:", max_entries)

    if(curr_want_entries == 0)
      return

  // update want progress

  if(curr_want_entries >= max_entries || old_want_entries == max_entries) {
    document.getElementById('connection-overlay-progressbar-want').value = 100
    document.getElementById('connection-overlay-progressbar-label-want').textContent = "Missing — Synchronized"
  } else {
    var newPosReq = (curr_want_entries - old_want_entries) / (max_entries - old_want_entries) * 100

    console.log("newPosMax:", newPosReq)

    document.getElementById('connection-overlay-progressbar-want').value = newPosReq
    document.getElementById('connection-overlay-progressbar-label-want').textContent = "Missing - " + (max_entries - curr_want_entries) + " entries left"

  }

  // update gift progress
  if (curr_want_entries <= min_entries || old_min_entries == curr_want_entries) {
    document.getElementById('connection-overlay-progressbar-gift').value = 100
    document.getElementById('connection-overlay-progressbar-label-gift').textContent = "Ahead — Synchronized"
  } else {
    var newPosOff = (min_entries - old_min_entries) / (curr_want_entries - old_min_entries) * 100

    document.getElementById('connection-overlay-progressbar-gift').value = newPosOff
    document.getElementById('connection-overlay-progressbar-label-gift').textContent = "Ahead - " + (curr_want_entries - min_entries) + " entries left"
  }
}

function chat_open_attachments_menu() {
    closeOverlay()
    document.getElementById('overlay-bg').style.display = 'initial'
    document.getElementById('attach-menu').style.display = 'initial'
}

// ---