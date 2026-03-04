// ==UserScript==
// @name        Iine Search
// @namespace        http://tampermonkey.net/
// @version        2.2
// @description        「いいね！された記事」の過去のアクション検索
// @author        Ameba Blog User
// @match        https://blog.ameba.jp/ucs/iine/list.html
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameba.jp
// @grant        none
// @updateURL        https://github.com/personwritep/Iine_Search/raw/main/Iine_Search.user.js
// @downloadURL        https://github.com/personwritep/Iine_Search/raw/main/Iine_Search.user.js
// ==/UserScript==


/* ======== 操作パネルと自動検索ツール ===========================*/

let drive_mode; // ページ更新時の動作モード
let search_id=0; // 検索対象のユーザーID
let search_id_able; // ID設定可能な状態
let list_bar; // 記事リストに読込んだ記事行の配列
let next_target; // ページ内の次の対象記事
let l_pos; // パネルデザイン
let io; // ダイアログデザイン
let vol; // beep音量
let help_url="https://ameblo.jp/personwritep/entry-12928418995.html";



setTimeout(()=>{
    mother();

    let targetm=document.querySelector('#navLeft');
    let monitorm=new MutationObserver(mother);
    monitorm.observe(targetm, { attributes: true });
}, 800);


function mother(){
    if(document.querySelector('#iineHistoryEntryFrame')){
        if(document.querySelector('#navbox_')){
            document.querySelector('#navbox_').remove(); }
        drive_mode='s';
        search_id_able=0;
        main(); }
    else if(document.querySelector('#iineHistoryUserFrame')){
        if(document.querySelector('#navbox')){
            document.querySelector('#navbox').remove(); }
        search_id_able=0;
        sub(); }}



function main(){
    let m_count=0; // mainでの発見数
    let nonstop=0; // 発見で停止しする「0」 停止しない「1」

    nav();

    function nav(){
        let nav_box=
            '<div id="navbox">'+
            '<button id="set_id">検索対象のIDを設定</button>'+
            '<button id="set_ok">IDを設定する</button>'+
            '<button id="set_cancel">中止</button>'+
            '<div class="nav_in">'+
            '<button class="is_help nav_sw">？</button>'+
            '<button class="s_l nav_sw">▲</button>'+
            '<input class="vol_s" type="range" min="0" max="1" step="0.1">'+
            '<button class="icon_only nav_sw">　</button>'+
            '</div>'+
            '<div id="search_id_box">未設定</div>'+
            '<div id="main_count"></div>'+
            '<button id="action">検索を開始する</button>'+
            '<div id="date_box">検索行の日付</div>'+
            '<div id="support"></div>'+

            '<style>'+
            '#navbox { position: fixed; top: 8px; left: 20px; z-index: 9500; '+
            'font: normal 16px meiryo; color: #000; width: 280px; padding: 10px 20px; '+
            'border: 1px solid #888; border-radius: 4px; '+
            'background: #5bb4d8; box-shadow: 0 0 40px 0 #00000040; }'+
            '.nav_in { display: flex; position: absolute; top: 10px; right: 20px; }'+
            '.nav_sw { font: bold 20px Meiryo; text-indent: -2px; height: 30px; width: 30px; '+
            'border: 1px solid #666; border-radius: 4px; background: #ffffff50; cursor: pointer; }'+
            '.is_help { line-height: 30px; border-radius: 40px; margin-right: 5px; }'+
            '.s_l { line-height: 28px; border-radius: 4px; }'+
            '.vol_s { position: absolute; top: 38px; right: 35px; width: 30px; height: 1px; '+
            'appearance: none; }'+
            '.vol_s::-webkit-slider-thumb { -webkit-appearance: none; '+
            'width: 8px; height: 13px; background: #8ecce4; border: 1px solid #666; '+
            'border-radius: 4px; box-sizing: border-box; }'+
            '.vol_s::-moz-range-thumb { '+
            'width: 8px; height: 13px; background: #8ecce4; border: 1px solid #666; '+
            'border-radius: 4px; box-sizing: border-box; }'+
            '.icon_only { position: absolute; top: 32px; right: 0; height: 12px; }'+
            '.is_help:hover, .s_l:hover, .icon_only:hover { background: #fff; }'+
            '#set_id, #set_ok, #set_cancel, #action { font: normal 16px Meiryo; '+
            'padding: 10px 16px 8px; background: #e4faff; border: 1px solid #888; '+
            'border-radius: 4px; cursor: pointer; }'+
            '#set_ok { padding: 10px 12px 8px; display: none; }'+
            '#set_cancel { padding: 10px 12px 8px; margin-left: 6px; display: none; }'+
            '#search_id_box, #date_box { height: 24px; '+
            'border: 1px solid #888; border-radius: 4px; background: #fff; }'+
            '#search_id_box { margin: 10px 0; padding: 3px 32px 1px 12px; '+
            'white-space: nowrap; overflow-x: scroll; scrollbar-width: none; }'+
            '#main_count { position: absolute; top: 68px; right: 30px; font: 16px Meiryo; }'+
            '#action { position: relative; z-index: 1; white-space: nowrap; max-width: 280px; }'+
            '#date_box { display: inline-block; padding: 3px 6px 1px; '+
            'position: absolute; top: 112px; right: 20px; }'+
            '#support { min-height: 47px; margin: 20px 0 0; padding: 16px 12px 13px; '+
            'white-space: break-spaces; border-radius: 4px; background: #fff; display: none; }'+
            '#support ic1 { font-size: 24px; line-height: 16px; }'+
            '#support ic2 { font-size: 20px; line-height: 16px; }'+
            '#support ic3 { font-size: 18px; line-height: 16px; color: red; }'+
            '#support .half { line-height: 0.5; }'+

            '.done { box-shadow: 9px 0 0 -1px #8dc8f8, -9px 0 0 -1px #8dc8f8; }'+
            '.have { box-shadow: 9px 0 0 -1px red, -9px 0 0 -1px red; }'+
            '.loading { background: unset; }'+
            '</style>'+

            '<style class="l_style">'+
            '#navbox { position: fixed; top: 50px; box-shadow: 0 20px 40px 0 #00000040; }'+
            '#support { display: block; }'+
            '</style>'+

            '<style class="io_style">'+
            '#iineEntryListMask { opacity: 0; }'+
            '#iineEntryFrame { width: 612px !important; outline: 1px solid green; '+
            'outline-offset: -1px; box-shadow: 0 0 40px 0 #00000040; }'+
            '#iineEntryContents { height: auto; padding: 2px 6px 4px; background: #aecbd5; }'+
            '#iineEntryListFrame { display: flex; flex-wrap: wrap; }'+
            '.iineListItem { padding: 0 !important; font-size: 0; border: none !important; '+
            'background: #aecbd5; }'+
            '.iineListItem a { margin: 4px !important; '+
            'outline-width: 3px !important; outline-offset: -1px !important; }'+
            '.iineListImg { margin: 0; }'+
            '.iineProfImg { height: 50px; width: 50px; }'+
            '.iineProfImg img { height: 50px !important; width: 50px !important; }'+
            '.iineListMain { display: none; }'+
            '.iineListItem:nth-of-type(10n + 1) { padding-left: 4px; }'+
            '.iineListItem:nth-of-type(10n) { padding-right: 4px; margin-right: -10px; }'+
            '#iineEntryFoot { border: none; }'+
            '</style>'+
            '</div>';

        if(!document.querySelector('#navbox')){
            document.body.insertAdjacentHTML('beforeend', nav_box); }

        let help_sw=document.querySelector('.is_help.nav_sw');
        if(help_sw){
            help_sw.onclick=()=>{
                window.open(help_url, '_blank', 'noopener=yes,noreferrer=yes'); }}


        let s_l_sw=document.querySelector('.s_l.nav_sw');
        let l_style=document.querySelector('.l_style');
        if(s_l_sw && l_style){
            let l_pos=get_cookie('Iine_l_pos');
            if(l_pos==0){
                s_l_sw.textContent='▲';
                l_style.disabled=false; }
            else{
                l_pos=1;
                s_l_sw.textContent='▼';
                l_style.disabled=true; }
            document.cookie='Iine_l_pos='+ l_pos +'; path=/; Max-Age=604800';

            s_l_sw.onclick=(event)=>{
                if(event.ctrlKey){
                    window.scroll(0, 0); }
                else{
                    if(l_pos==0){
                        l_pos=1;
                        s_l_sw.textContent='▼';
                        l_style.disabled=true; }
                    else{
                        l_pos=0;
                        s_l_sw.textContent='▲';
                        l_style.disabled=false; }
                    document.cookie='Iine_l_pos='+ l_pos +'; path=/; Max-Age=604800'; }}}


        let vol_s=document.querySelector('.vol_s');
        if(vol_s){
            vol=get_cookie('Iine_vol');
            vol_s.value=vol;
            document.cookie='Iine_vol='+ vol +'; path=/; Max-Age=604800';

            vol_s.addEventListener('input', function(){
                vol=vol_s.value;
                document.cookie='Iine_vol='+ vol +'; path=/; Max-Age=604800'; }); }


        let icon_only=document.querySelector('.icon_only');
        let io_style=document.querySelector('.io_style');
        if(icon_only && io_style){
            let io=get_cookie('Iine_io');
            if(io==0){
                icon_only.style.background='';
                io_style.disabled=true; }
            else{
                io=1;
                icon_only.style.background='#00f4ff';
                io_style.disabled=false; }
            document.cookie='Iine_io='+ io +'; path=/; Max-Age=604800';

            icon_only.onclick=()=>{
                if(io==0){
                    io=1;
                    icon_only.style.background='#00f4ff';
                    io_style.disabled=false; }
                else{
                    io=0;
                    icon_only.style.background='';
                    io_style.disabled=true; }
                document.cookie='Iine_io='+ io +'; path=/; Max-Age=604800'; }}


        let search_id_box=document.querySelector('#search_id_box');
        if(search_id_box){
            search_id=get_cookie('Iine_ID');
            if(search_id!=0){
                search_id_box.textContent=search_id;
                let str=
                    '<p><ic1>⚠️</ic1> 検索対象のIDは前回を継承</p>'+
                    '<p class="half">　</p>'+
                    '<p>別のユーザーを検索するには、検索対象のユーザーIDを再設定します</p>';
                support(str);
                document.cookie='Iine_ID='+ search_id +'; path=/; Max-Age=604800'; } // 7日間保持
            else{
                let str=
                    '<p><ic1>⚠️</ic1> 検索対象のIDが未設定です</p>'+
                    '<p class="half">　</p>'+
                    '<p>検索を機能させるには、検索対象のユーザーIDの設定が必要です</p>';
                support(str); }}

    } // nav()



    setTimeout(()=>{
        let table=document.querySelector('#iineHistoryEntryFrame tbody');
        if(table){
            let monitor0=new MutationObserver(clicked_item);
            monitor0.observe(table, {childList: true});

            clicked_item(); }
    }, 1000);


    function clicked_item(){
        list_bar=document.querySelectorAll('.tableList .iineEntryCnt');
        for(let k=0; k<list_bar.length; k++){
            list_bar[k].onclick=function(event){
                if(event.ctrlKey){
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    wild_search(k); }}}

        function wild_search(k){
            if(search_id_able==0){
                drive_mode='c'; // ページ内の連続処理
                let action=document.querySelector('#navbox #action');
                if(action){
                    action.textContent='一旦停止　❚❚'; }
                let str=
                    '<p>「❚❚」ボタンを押す：一旦停止</p>'+
                    '<p>「▶」ボタンを押す：検索再開</p>'+
                    '<p>「<b>Shift+Click</b>」検出停止・非停止</p>'+
                    '<p class="half">　</p>'+
                    '<p> 任意のリスト行を「<b>Ctrl+Click</b>」</p>'+
                    '<p> 　➔ その行から検索を開始</p>';
                support(str);
                not_set(1);
                open_dialog(k); }}

    } // clicked_item()



    control_pannel();

    function control_pannel(){
        let action=document.querySelector('#navbox #action');
        if(action){
            let set_id=document.querySelector('#navbox #set_id');
            if(set_id){
                set_id.addEventListener('click', function(event){
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if(search_id_able==0){
                        search_id_able=1;
                        action.disabled=true;
                        set_id.textContent='IDの設定を中止';

                        let str=
                            '<p>検索するユーザーを設定するには</P>'+
                            '<p class="half">　</p>'+
                            '<p>❶ 検索対象を含む記事を「<b>Click</b>」</P>'+
                            '<p>　 その記事のダイアログを開く</P>'+
                            '<p class="half">　</p>'+
                            '<p>❷ 検索対象の行を「<b>Click</b>」する</P>'+
                            '<p>　</p>'+
                            '<p>操作を中止して元の状態に戻るには「IDの設定を中止」を押します</P>';
                        support(str);

                        let search_id_box=document.querySelector('#search_id_box');
                        if(search_id_box){
                            let search_id_new=get_cookie('Iine_ID');
                            if(search_id_box.textContent!=search_id_new){ // 別ウインドウで「ID」更新
                                decision(1);
                                decision_str(search_id_new, 1);

                                let set_ok=document.querySelector('#navbox #set_ok');
                                let set_cancel=document.querySelector('#navbox #set_cancel');
                                if(set_ok && set_cancel){
                                    set_ok.onclick=()=>{
                                        decision(0);
                                        search_id=search_id_new;
                                        search_id_box.textContent=search_id;
                                        document.cookie='Iine_ID='+ search_id +'; path=/; Max-Age=604800';
                                        end_set_id(1);
                                        clear_list_done();
                                        search_id_able=0;
                                        action.disabled=false;
                                        drive_mode='s'; } //「s」停止モード 再検索可能

                                    set_cancel.onclick=()=>{
                                        decision(0);
                                        set_id.click(); }}
                            } // 別ウインドウで「ID」更新


                            if(search_id!=0){
                                search_id_box.textContent=search_id; }
                            else{
                                search_id_box.textContent="未設定"; }}
                        get_id(); }

                    else{
                        search_id_able=0;
                        action.disabled=false;
                        set_id.textContent='検索対象のIDを設定';
                        let str=
                            '<p>「❚❚」ボタンを押す：一旦停止</p>'+
                            '<p>「▶」ボタンを押す：検索再開</p>'+
                            '<p>「<b>Shift+Click</b>」検出停止・非停止</p>'+
                            '<p class="half">　</p>'+
                            '<p> 任意のリスト行を「<b>Ctrl+Click</b>」</p>'+
                            '<p> 　➔ その行から検索を開始</p>';
                        support(str); }
                }); }


            let iine_Mask=document.querySelector('#iineEntryListMask');
            if(iine_Mask){
                let monitor1=new MutationObserver(get_end);
                monitor1.observe(iine_Mask, { attributes: true });

                function get_end(){
                    if(search_id_able==1){
                        if(iine_Mask.classList.contains('hide')){
                            decision(0);
                            let set_id=document.querySelector('#navbox #set_id');
                            if(set_id){
                                set_id.click(); }}}}}



            action.addEventListener('click', function(event){
                event.preventDefault();
                event.stopImmediatePropagation();
                if(event.shiftKey){
                    if(nonstop==0){
                        nonstop=1;
                        action.style.background='#1ad4ff'; }
                    else{
                        nonstop=0;
                        action.style.background='#e4faff'; }}
                else{
                    start_stop(); }
            }); // 処理のコントロール


            function start_stop(){
                if(drive_mode=='s'){
                    let str=
                        '<p><ic2>🔴</ic2> ダイアログ検索を開始します</p>'+
                        '<p class="half">　</p>'+
                        '<p>▶ リストの行を「<b>Ctrl+Click</b>」</p>'+
                        '<p>　 その行以降の検索を開始します</p>'+
                        '<p class="half">　</p>'+
                        '<p>▶「一旦停止 ❚❚」ボタンを押すと</p>'+
                        '<p>　 検索停止 / 検索再開 ができます</p>';
                    support(str);
                    action.textContent='検索を開始する行を「Ctrl+Click」';
                    close_dialog(); }

                else if(drive_mode=='c'){ // 連続動作状態の場合
                    drive_mode='p'; // クリックされたら「p」停止モード
                    action.textContent='検索再開　▶';
                    not_set(0);
                    un_dark(); }

                else if(drive_mode=='p'){ // 動作停止状態の場合
                    drive_mode='c'; // クリックされたら連続動作を再開
                    action.textContent='一旦停止　❚❚';
                    not_set(1);
                    open_dialog(next_target); }

                else if(drive_mode=='e'){ // 動作停止状態の場合 リスト末尾
                    drive_mode='c'; // クリックされたら連続動作を再開
                    action.textContent='一旦停止　❚❚';
                    let str=
                        '<p>「❚❚」ボタンを押す：一旦停止</p>'+
                        '<p>「▶」ボタンを押す：検索再開</p>'+
                        '<p>「<b>Shift+Click</b>」検出停止・非停止</p>'+
                        '<p class="half">　</p>'+
                        '<p> 任意のリスト行を「<b>Ctrl+Click</b>」</p>'+
                        '<p> 　➔ その行から検索を開始</p>';
                    support(str);
                    not_set(1);
                    open_dialog(next_target); }

            } // start_stop()


            document.addEventListener('keydown', function(event){
                if(event.keyCode==13){
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    let action=document.querySelector('#navbox #action');
                    if(action){
                        action.click(); }}});

        } // if(action)
    } // control_pannel()



    function not_set(n){
        let set_id=document.querySelector('#navbox #set_id');
        if(set_id){
            if(n==0){
                set_id.disabled=false; }
            else{
                set_id.disabled=true; }}}



    function open_dialog(k){
        let action=document.querySelector('#navbox #action');
        if(action){
            next_target=k; // この段階は未処理

            if(drive_mode=='c'){
                list_bar[k].classList.add('done'); // リストに青バーを表示
                scroll_center(list_bar[k]);
                date_disp(list_bar[k]);
                list_bar[k].click();

                setTimeout(()=>{
                    clear_frame();
                }, 100);

                setTimeout(()=>{
                    if(search_who()){
                        beep();
                        list_bar[k].classList.add('have'); // リストに赤バーを表示
                        disp_m_count();

                        if(nonstop==0){
                            drive_mode='p'; //「p」停止モード
                            action.textContent='検索再開　▶';
                            not_set(0); }
                        else{
                            close_dialog();
                            dark(); }

                        end_target(); }
                    else{
                        close_dialog();
                        dark();
                        end_target(); } // 終了後に次の行へ移行

                }, 2000); // リストのロードタイミング



                function search_who(){
                    if(search_id!=0){ //「0」の場合はID未設定
                        let iLI=document.querySelectorAll('.iineListItem a');
                        for(let i=0; i<iLI.length; i++){
                            let link=iLI[i].getAttribute('href');
                            if(link){
                                if(link.includes(search_id)){
                                    iLI[i].style.outline='2px solid red';
                                    iLI[i].style.outlineOffset='6px';
                                    iLI[i].scrollIntoView({block: "center"});
                                    return true; }}}}

                } // search_who()



                function clear_frame(){
                    let iEC=document.querySelectorAll('#iineEntryContener');
                    if(iEC.length>1){
                        for(let k=1; k<iEC.length; k++){
                            iEC[k].remove(); }}

                    let iELF=document.querySelectorAll('#iineEntryListFrame');
                    if(iELF.length>1){
                        for(let k=1; k<iELF.length; k++){
                            iELF[k].remove(); }}
                } // clear_frame()



                function end_target(){ // 終了処理
                    setTimeout(()=>{
                        next_do(k); }, 10); //⏩

                    function next_do(k){
                        next_target=k+1;
                        if(next_target<list_bar.length){
                            open_dialog(next_target); }
                        else{
                            let more=document.querySelector('#moreEntryLink'); // Moreボタン
                            if(more){
                                more.click();

                                let retry=0;
                                let interval=setInterval(wait_target, 100);
                                function wait_target(){
                                    retry++;
                                    if(retry>40){ // 4sec待機
                                        err(); // 次リストの読込み不可
                                        clearInterval(interval); }
                                    list_bar=document.querySelectorAll('.tableList .iineEntryCnt');
                                    if(next_target<list_bar.length){ // 次リストの読込み完了
                                        clearInterval(interval);
                                        open_dialog(next_target); }}

                                function err(){
                                    drive_mode='e'; //「e」リスト末尾停止モード
                                    action.textContent='検索再開　▶';
                                    let str=
                                        '<p><ic2>💢</ic2> 履歴データ 読み込みエラー</p>';
                                    support(str);
                                    beep();
                                    not_set(0);
                                    un_dark(); }}

                            else{ // 履歴の末尾でmoreボタンが無い
                                drive_mode='e'; //「e」リスト末尾停止モード
                                action.textContent='検索再開　▶';
                                let str=
                                    '<p><ic2>⛔</ic2> 履歴の末尾まで検索しました</p>'+
                                    '<p class="half">　</p>'+
                                    '<p> リスト行を「<b>Ctrl+Click</b>」すれば</p>'+
                                    '<p> その行から検索を再開できます</p>';
                                support(str);
                                action.textContent='検索を開始する行を「Ctrl+Click」';
                                beep();
                                not_set(0);
                                un_dark(); }}

                    } // next_do()
                } // end_target()
            } // if(drive_mode=='c')
        } // if(action)
    } // open_dialog()



    function scroll_center(target){
        let iHC=document.querySelector('#iineHistoryContent tbody');
        if(iHC){
            let offsetTop=target.offsetTop - iHC.offsetTop - iHC.clientHeight/2;
            iHC.scrollTo({top: offsetTop, left: 0, behavior: "smooth"}); }}



    function disp_m_count(){
        let have_all=document.querySelectorAll('.have');
        let main_count=document.querySelector('#main_count');
        if(main_count){
            main_count.textContent=have_all.length; }}



    function date_disp(target){
        let date_box=document.querySelector('#date_box');
        let time=target.querySelector('time');
        if(date_box && time){
            date_box.textContent=time.textContent; }}



    function close_dialog(){
        let iCB=document.querySelector('#iineCloseBtn');
        if(iCB){
            iCB.click(); }}


    function dark(){
        let iELM=document.querySelector('#iineEntryListMask');
        if(iELM){
            iELM.classList.remove('hide'); }}


    function un_dark(){
        setTimeout(()=>{
            let iELM=document.querySelector('#iineEntryListMask');
            let iEF=document.querySelector('#iineEntryFrame');
            if(iELM && iEF){
                if(iEF.clientHeight==0){
                    iELM.classList.add('hide'); }}
        }, 1000);
        setTimeout(()=>{
            let iELM=document.querySelector('#iineEntryListMask');
            let iEF=document.querySelector('#iineEntryFrame');
            if(iELM && iEF){
                if(iEF.clientHeight==0){
                    iELM.classList.add('hide'); }}
        }, 2000); }



    function support(str){
        let support=document.querySelector('#support');
        if(support){
            support.innerHTML=str; }}



    function end_set_id(n){
        let set_id=document.querySelector('#navbox #set_id');
        if(set_id){
            set_id.textContent='検索対象のIDを設定'; }
        let str;
        if(n==0){
            str='<p>検索対象のIDが設定されました</P>'+
                '<p>現在のダイアログを閉じてください</P>'; }
        else{
            str='<p>検索対象のIDを同期しました</P>'+
                '<p>検索結果のマークを初期化しました</P>'; }
        support(str); }



    function get_id(){
        document.addEventListener('click', function(event){
            if(search_id_able==1){
                let elem=document.elementFromPoint(event.clientX, event.clientY);
                if(elem){
                    let list_elem=elem.closest('li');
                    if(list_elem){
                        if(list_elem.classList.contains('iineListItem')){
                            event.preventDefault();
                            event.stopImmediatePropagation();
                            get(list_elem); }}}}});


        function get(target){
            let link=target.querySelector('a');
            if(link){
                let link_href=link.getAttribute('href');
                if(link_href){
                    let part=link_href.split('/');
                    let search_id_new=part[part.length-2];
                    let search_id_box=document.querySelector('#search_id_box');
                    if(search_id_box){
                        clear_line();
                        target.style.outline='2px solid #2196f3';
                        target.style.outlineOffset='-3px';

                        decision(1);
                        decision_str(search_id_new, 0);

                        let set_id=document.querySelector('#navbox #set_id');
                        let set_ok=document.querySelector('#navbox #set_ok');
                        let set_cancel=document.querySelector('#navbox #set_cancel');
                        let action=document.querySelector('#navbox #action');
                        if(set_id && set_ok && set_cancel && action){
                            set_ok.onclick=()=>{
                                decision(0);
                                search_id=search_id_new;
                                search_id_box.textContent=search_id;
                                document.cookie='Iine_ID='+ search_id +'; path=/; Max-Age=604800';
                                end_set_id(0);
                                clear_list_done();
                                search_id_able=0;
                                action.disabled=false;
                                drive_mode='s'; } //「s」停止モード 再検索可能

                            set_cancel.onclick=()=>{
                                decision(0);
                                clear_line();
                                set_id.click(); }}}}}

        } // get()
    } // get_id()


    function clear_line(){
        let item=document.querySelectorAll('#iineEntryListFrame .iineListItem');
        for(let k=0; k<item.length; k++){
            item[k].style.outline=''; }}


    function clear_list_done(){
        list_bar=document.querySelectorAll('.tableList .iineEntryCnt');
        for(let k=0; k<list_bar.length; k++){
            list_bar[k].classList.remove('done'); // リストの青バーを削除
            list_bar[k].classList.remove('have'); } // リストの赤バーを削除
        disp_m_count(); } // mainのカウントをリセット


    function decision_str(new_id, n){
        let str;
        if(n==0){
            str=
                '<p><ic2>🔴</ic2> 検索対象のIDを変更します</P>'+
                '<p class="half">　</p>'+
                '<p>上枠のこれまでの検索対象のIDはリセットされます　'+
                '必要ならコピーして保存してください</P>'; }
        else{
            str=
                '<p><ic2>💢</ic2> 別画面で「検索対象のID」が更新されました</P>'; }
        str+=
            '<p class="half">　</p>'+
            '<p>新しい検索対象のID： </P>'+
            '<p>'+ new_id +'</P>'+
            '<p class="half">　</p>'+
            '<p>「IDを設定する」を押すと「ID」を更新し、'+
            '検索結果を示す「青・赤のマーク」を初期化します</P>';
        if(n==1){
            str+=
                '<p class="half">　</p>'+
                '<p>また、ダイアログを開いて別ユーザーを新しい検索対象に指定できます</P>'; }
        support(str); } // decision_str()


    function decision(n){
        let set_id=document.querySelector('#navbox #set_id');
        let set_ok=document.querySelector('#navbox #set_ok');
        let set_cancel=document.querySelector('#navbox #set_cancel');
        if(set_id && set_ok && set_cancel){
            if(n==0){
                set_id.style.display='inline-block';
                set_ok.style.display='none';
                set_cancel.style.display='none'; }
            else{
                set_id.style.display='none';
                set_ok.style.display='inline-block';
                set_cancel.style.display='inline-block'; }}

    } // decision(n)



    user_blog();

    function user_blog(){
        document.addEventListener('contextmenu', function(event){
            let elem=document.elementFromPoint(event.clientX, event.clientY);
            if(elem){
                let list_elem=elem.closest('li');
                if(list_elem){
                    if(list_elem.classList.contains('iineListItem')){
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        get_blog(list_elem); }}}});

        function get_blog(target){
            let link=target.querySelector('a');
            if(link){
                let link_href=link.getAttribute('href');
                if(link_href){
                    window.open(link_href, '_blank', 'noopener=yes,noreferrer=yes'); }}}

    } // user_blog()
} // main()




function sub(){
    nav_();

    function nav_(){
        let search_svg=
            '<svg viewBox="0 0 512 512">'+
            '<path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 3'+
            '2.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 '+
            '416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0'+
            '-288 144 144 0 1 0 0 288z"/>'+
            '</svg>';

        let nav_box_=
            '<div id="navbox_">'+
            '<button id="set_id_">検索対象のIDを設定</button>'+
            '<button id="set_ok_">IDを設定する</button>'+
            '<button id="set_cancel_">中止</button>'+
            '<button id="sort_">Sort</button>'+
            '<div id="search_id_box_">未設定</div>'+
            '<button id="ask_">'+ search_svg +'</button>'+
            '<div id="support_"></div>'+

            '<style>'+
            '#navbox_ { position: fixed; top: 8px; left: 20px; z-index: 9500; '+
            'font: normal 16px meiryo; color: #000; width: 280px; padding: 10px 20px; '+
            'border: 1px solid #888; border-radius: 4px; '+
            'background: #5bb4d8; box-shadow: 0 0 40px 0 #00000040; }'+
            '#set_id_, #set_ok_, #set_cancel_ , #sort_ { font: normal 16px Meiryo; '+
            'padding: 10px 16px 8px; background: #e4faff; border: 1px solid #888; '+
            'border-radius: 4px; cursor: pointer; }'+
            '#set_ok_ { padding: 10px 12px 8px; display: none; }'+
            '#set_cancel_ { padding: 10px 12px 8px; margin-left: 6px; display: none; }'+
            '#sort_ { position: absolute; top: 10px; right: 20px; }'+
            '#search_id_box_ { height: 24px; margin: 10px 0; padding: 3px 38px 1px 12px; '+
            'border: 1px solid #888; border-radius: 4px; background: #fff; '+
            'white-space: nowrap; overflow-x: scroll; scrollbar-width: none; }'+
            '#ask_ { position: absolute; top: 67px; right: 28px; padding: 3px 3px 0; '+
            'border: 1px solid #777; border-radius: 4px; background: #9df5da; cursor: pointer; }'+
            '#ask_ svg{ width: 16px; height: 16px; }'+
            '#support_ { min-height: 24px; margin: 20px 0 0; padding: 16px 12px 13px; '+
            'white-space: break-spaces; border-radius: 4px; background: #fff; }'+
            '#support_ ic2 { font-size: 20px; line-height: 16px; }'+
            '#support_ .half { line-height: 0.5; }'+
            '</style>'+
            '</div>';

        if(!document.querySelector('#navbox_')){
            document.body.insertAdjacentHTML('beforeend', nav_box_); }

        id_check_();

    } // nav_()



    function id_check_(){
        let search_id_box_=document.querySelector('#search_id_box_');
        if(search_id_box_){
            search_id=get_cookie('Iine_ID');
            if(search_id!=0){
                search_id_box_.textContent=search_id;
                let str=
                    '<p>上枠は現在の検索対象のID</p>';
                support_(str);
                document.cookie='Iine_ID='+ search_id +'; path=/; Max-Age=604800'; } // 7日間保持
            else{
                let str=
                    '<p>検索対象のIDが未設定です</p>';
                support_(str); }}

    } // id_check_()



    function support_(str){
        let support_=document.querySelector('#support_');
        if(support_){
            support_.innerHTML=str; }}


    function end_set_id_(n){
        let set_id_=document.querySelector('#navbox_ #set_id_');
        if(set_id_){
            set_id_.textContent='検索対象のIDを設定'; }
        let str;
        if(n==0){
            str='<p>検索対象のIDが設定されました</P>'; }
        else{
            str='<p>検索対象のIDを同期しました</P>'; }
        support_(str); }



    control_pannel_();

    function control_pannel_(){
        let set_id_=document.querySelector('#navbox_ #set_id_');
        if(set_id_){
            set_id_.addEventListener('click', function(event){
                event.preventDefault();
                event.stopImmediatePropagation();
                if(search_id_able==0){
                    search_id_able=1;
                    set_id_.textContent='IDの設定を中止';
                    let str=
                        '<p>検索対象に設定するユーザーの行を</P>'+
                        '<p>「<b>Click</b>」します</P>';
                    support_(str);

                    let search_id_box_=document.querySelector('#search_id_box_');
                    if(search_id_box_){
                        let search_id_new=get_cookie('Iine_ID');
                        if(search_id_box_.textContent!=search_id_new){ // 別ウインドウで「ID」更新
                            decision_(1);
                            decision_str_(search_id_new, 1);

                            let set_ok_=document.querySelector('#navbox_ #set_ok_');
                            let set_cancel_=document.querySelector('#navbox_ #set_cancel_');
                            if(set_ok_ && set_cancel_){
                                set_ok_.onclick=()=>{
                                    decision_(0);
                                    search_id=search_id_new;
                                    search_id_box_.textContent=search_id;
                                    document.cookie='Iine_ID='+ search_id +'; path=/; Max-Age=604800';
                                    end_set_id_(1);
                                    clear_line_();
                                    search_id_able=0; }

                                set_cancel_.onclick=()=>{
                                    decision_(0);
                                    set_id_.click(); }}
                        } // 別ウインドウで「ID」更新


                        if(search_id!=0){
                            search_id_box_.textContent=search_id; }
                        else{
                            search_id_box_.textContent="未設定"; }}
                    get_id_(); }

                else{
                    search_id_able=0;
                    set_id_.textContent='検索対象のIDを設定';
                    let str=
                        '<p>検索するユーザーを変更するには</P>'+
                        '<p>「検索対象の1Dを設定」を押す</P>';
                    support_(str); }
            }); }

    } // control_pannel_()



    function get_id_(){
        document.addEventListener('click', function(event){
            if(search_id_able==1){
                let elem=document.elementFromPoint(event.clientX, event.clientY);
                if(elem){
                    let tr_elem=elem.closest('tr');
                    if(tr_elem){
                        let user_link=tr_elem.querySelector('.heading a');
                        if(user_link){
                            event.preventDefault();
                            event.stopImmediatePropagation();
                            get_(user_link, tr_elem); }}}}});


        function get_(target, target_tr){
            let link_href=target.getAttribute('href');
            if(link_href){
                clear_line_();
                target_tr.style.outline='2px solid #2196f3';
                target_tr.style.outlineOffset='-1px';

                let part=link_href.split('/');
                let search_id_new=part[part.length-2];
                let search_id_box_=document.querySelector('#search_id_box_');
                if(search_id_box_){
                    decision_(1);
                    decision_str_(search_id_new, 0);

                    let set_id_=document.querySelector('#navbox_ #set_id_');
                    let set_ok_=document.querySelector('#navbox_ #set_ok_');
                    let set_cancel_=document.querySelector('#navbox_ #set_cancel_');
                    if(set_id_ && set_ok_ && set_cancel_){
                        set_ok_.onclick=()=>{
                            decision_(0);
                            search_id=search_id_new;
                            search_id_box_.textContent=search_id;
                            document.cookie='Iine_ID='+ search_id +'; path=/; Max-Age=604800';
                            end_set_id_(0)
                            search_id_able=0; }

                        set_cancel_.onclick=()=>{
                            decision_(0);
                            clear_line_();
                            set_id_.click(); }}}}

        } // get_()
    } // get_id_()


    function clear_line_(){
        let item=document.querySelectorAll('#iineHistoryUserFrame tr');
        for(let k=0; k<item.length; k++){
            item[k].style.outline=''; }}


    function decision_str_(new_id, n){
        let str;
        if(n==0){
            str='<p><ic2>🔴</ic2> 検索対象のIDを変更します</P>'; }
        else{
            str='<p><ic2>💢</ic2> 別画面で「検索対象のID」が更新されました</P>'; }
        str+=
            '<p class="half">　</p>'+
            '<p>新しい検索対象のID： </P>'+
            '<p>'+ new_id +'</P>';
        support_(str); }


    function decision_(n){
        let set_id_=document.querySelector('#navbox_ #set_id_');
        let set_ok_=document.querySelector('#navbox_ #set_ok_');
        let set_cancel_=document.querySelector('#navbox_ #set_cancel_');
        if(set_id_ && set_ok_ && set_cancel_){
            if(n==0){
                set_id_.style.display='inline-block';
                set_ok_.style.display='none';
                set_cancel_.style.display='none'; }
            else{
                set_id_.style.display='none';
                set_ok_.style.display='inline-block';
                set_cancel_.style.display='inline-block'; }}

    } // decision_(n)



    user_blog_();

    function user_blog_(){
        document.addEventListener('contextmenu', function(event){
            let elem=document.elementFromPoint(event.clientX, event.clientY);
            if(elem){
                let tr_elem=elem.closest('tr');
                if(tr_elem){
                    let user_link=tr_elem.querySelector('.heading a');
                    if(user_link){
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        get_blog(user_link); }}}});

        function get_blog(target){
            let link_href=target.getAttribute('href');
            if(link_href){
                window.open(link_href, '_blank', 'noopener=yes,noreferrer=yes'); }}

    } // user_blog_()



    let sort_sw=document.querySelector('#sort_');
    if(sort_sw){
        sort_sw.onclick=()=>{
            sort(); }}

    function sort(){
        window.getSelection().removeAllRanges();

        let iine_arr=[];

        let iine_tr=document.querySelectorAll('#iineHistoryUserFrame tr');
        for(let k=1; k<iine_tr.length; k++){
            let user_href;
            let user_name;
            let user_count;
            let user_id;
            let user_src=iine_tr[k].querySelector('.list_img img').getAttribute('src');
            if(iine_tr[k].querySelector('.heading a')){
                user_href=iine_tr[k].querySelector('.heading a').getAttribute('href');
                if(user_href){
                    let part=user_href.split('/');
                    user_id=part[part.length-2]; }
                user_name=iine_tr[k].querySelector('.heading a span').textContent;
                user_count=parseInt(
                    iine_tr[k].querySelector('.iineCnt').textContent.replace(/[^0-9]/g, ''), 10); }
            else{ // 退会ユーザー
                user_href='---';
                user_name='---';
                user_count=0;
                user_id='---'; }

            iine_arr.push([user_src, user_href, user_name, user_count, user_id]); } // データの配列化


        iine_arr.sort((a, b)=>{
            return b[b.length-2] - a[a.length-2] }) // user_count の降順にソート


        let iine_table=document.querySelector('#iineHistoryUserFrame tbody');
        let iine_r_tr=iine_table.querySelectorAll('tr');
        for(let k=1; k<iine_r_tr.length; k++){
            iine_r_tr[k].remove(); }


        for(let k=0; k<iine_arr.length; k++){
            let iine_tr=
                '<tr>'+
                '<td class="is"><b class="list_img"><img src="'+ iine_arr[k][0] +'"></b>'+
                '<div class="list_main"><div class="is heading"><a href="'+ iine_arr[k][1] +'">'+
                '<span>'+ iine_arr[k][2] +'</span>'+
                '<span class="is_id">'+ iine_arr[k][4] +'</span></a>'+
                '</div></div></td>'+
                '<td class="is iineCnt">'+ iine_arr[k][3] +'</td>'+
                '</tr>';

            if(iine_table.childElementCount<iine_r_tr.length){
                iine_table.insertAdjacentHTML('beforeend', iine_tr); }} // 配列のtableへの再配置

    } // sort()



    let ask_sw=document.querySelector('#ask_');
    if(ask_sw){
        ask_sw.onclick=()=>{
            ask(); }}

    function ask(){
        let find=0;
        let search_id;
        let box=document.querySelector('#search_id_box_');
        if(box){
            search_id=box.textContent;

            let iHUF=document.querySelectorAll('#iineHistoryUserFrame tr');
            for(let k=0; k<iHUF.length; k++){
                let user_link=iHUF[k].querySelector('.heading a');
                if(user_link){
                    let link_href=user_link.getAttribute('href');
                    if(link_href && search_id){
                        if(link_href.includes(search_id)){
                            find=1;
                            iHUF[k].style.outline='2px solid #00cf8e';
                            iHUF[k].style.outlineOffset='-1px';
                            scroll_center_(iHUF[k]);
                            let str=
                                '<p><ic2>🟢</ic2> 検索対象のIDのユーザー行に</p>'+
                                '<p>　　緑枠を表示しました</p>';
                            support_(str); }}}}

            if(find==0){ // 検索にヒットしなかった場合
                let str=
                    '<p><ic2>🔴</ic2> 検索対象は見つかりません</p>'+
                    '<p class="half">　</p>'+
                    '<p>▪全リストの読込みを試して下さい</p>'+
                    '<p>▪データの範囲は最近の90日です</p>';
                support_(str);

                setTimeout(()=>{
                    id_check_();
                }, 4000); }}

    } // ask()



    function scroll_center_(target){
        let iHC=document.querySelector('#iineHistoryUserFrame tbody');
        if(iHC){
            let offsetTop=target.offsetTop - iHC.offsetTop - iHC.clientHeight/2;
            iHC.scrollTo({top: offsetTop, left: 0, behavior: "smooth"}); }}

} // sub()




/* ======== 共通関数  ======================================*/

function get_cookie(name){
    let cookie_req=document.cookie.split('; ').find(row=>row.startsWith(name));
    if(cookie_req){
        if(cookie_req.split('=')[1]==null){
            return 0; }
        else{
            return cookie_req.split('=')[1]; }}
    if(!cookie_req){
        return 0; }}



function beep(){
    let context=new AudioContext();
    let o=context.createOscillator();
    let g=context.createGain();
    o.frequency.value=1000;
    o.connect(g);
    g.connect(context.destination);
    g.gain.setValueAtTime(vol, context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 2);
    o.start(context.currentTime);
    o.stop(context.currentTime + 2);
    o.onended=()=>{
        g.disconnect(context.destination);
        o.disconnect(g); }

} // beep()


/* ======== 履歴リスト全体の自動スクロール =========================*/

let target2=document.head; // 監視 target2
let monitor2=new MutationObserver(end_more);
monitor2.observe(target2, { childList: true }); // 監視開始

end_more();

function end_more(){
    let senser=0;
    let next=0;
    let interval;

    let list_frame=document.querySelector('#iineHistoryContent');
    if(list_frame){
        let style=
            '<style id="imute_style_r">'+
            '#ucsContent { margin: 0 20px 0 auto; height: 100vh; }'+
            '.iineSetting { display: none; }'+

            '.tabCategory { display: flex; justify-content: center; }'+
            '.tabCategory li { margin: 0 10px; }'+
            '#iineHistoryContent table { position: relative; }'+
            '#iineHistoryContent tbody { display: block; overflow-y: scroll; margin-top: 34px; '+
            'height: calc( 100vh - 260px) !important; border-bottom: 1px solid #ccc; '+
            'padding-left: 8px; padding-right: 8px; }'+
            '.tableList th { width: inherit; font-size: 14px; padding: 8px 4px 6px; '+
            'text-align: center !important; background: #f4f4f4; }'+
            '#iineHistoryContent tr:first-child { position: absolute; z-index: 1; width: 786px; '+
            'top: 1px; left: -1px; border-left: 1px solid #ccc; border-right: 1px solid #ccc; }'+
            '#ucsMain #moreLoading { margin: -3px auto; }'+
            '#iineHistoryUserFrame .tableList th.rightCell { width: 200px; }'+
            '#ucsMain .moreLinkBottom span { '+
            'background-position: 0 4px; font-size: 14px; }'+
            '#iineHistoryEntryFrame:after, #iineHistoryUserFrame:after { '+
            'content: "▢ Space: 連続スクロール / 停止"; '+
            'position: absolute; right: 10px; margin: 0; border: 1px solid #aaa; '+
            'padding: 3px 12px 1px; font: bold 14px Meiryo; color: #888; background: #fff; }'+
            '#iineHistoryEntryFrame.listend:after, #iineHistoryUserFrame.listend:after { '+
            'content: "全リストを読み込みました"; right: 300px; bottom: -12px; '+
            'background: #fff600; }'+

            '.mask { opacity: 0.4; }'+
            '#iineEntryFrame { position: fixed; top: 8px !important; left: 380px !important; }'+
            '#iineEntryHeader .iineListHeaderText { white-space: nowrap; overflow-x: scroll; '+
            'scrollbar-width: none; }'+
            '#iineEntryContents { max-height: unset !important; height: calc(100vh - 56px); '+
            'background: #4b7778; scrollbar-width: none; }'+
            '.iineListItem { background: #d5e7ed; }'+
            '.iineListItem a { pointer-events: none; }'+ // いいね！された記事
            '#moreLinkBtm { visibility: hidden; }'+

            '#iineHistoryUserFrame table tr a { pointer-events: none; }'+ // いいね！してくれた人

            '#iineHistoryUserFrame .is.heading { position: relative; margin-top: 12px; }'+
            '#iineHistoryUserFrame .is_id { position: absolute; top: -2px; left: 320px; '+
            'font: normal 16px / 20px Meiryo; padding: 2px 20px 1px; background: #eef1f3; '+
            'width: 210px; border-left: solid 20px #fff; border-right: solid 40px #fff; }'+

            '#footerAd, #globalFooter { display: none; }'+
            'html, body { overflow: hidden; }'+
            'html.noscroll { padding-right: 0 !important; }'+
            '</style>';

        if(list_frame.querySelector('#imute_style_r')){
            list_frame.querySelector('#imute_style_r').remove(); } // styleタグ 更新上書き
        list_frame.insertAdjacentHTML('beforeend', style); }



    document.addEventListener('keydown', function(event){
        if(document.querySelector('#iineHistoryEntryFrame')){
            auto_scroll(event, '#iineHistoryEntryFrame', '#moreEntryLink'); }
        else if(document.querySelector('#iineHistoryUserFrame')){
            auto_scroll(event, '#iineHistoryUserFrame', '#moreUserLink'); }});

    function auto_scroll(event, ascroll_box, abutton){
        if(event.keyCode==32){
            event.preventDefault();
            if(active_check()){
                event.stopImmediatePropagation(); }

            if(next==0 && active_check()){
                act(0);
                next=1;
                interval=setInterval(
                    function(){
                        go();
                        stop();
                        senser+=1;
                    }, 500); }
            else{
                act(1);
                next=0;
                clearInterval(interval); }

            setTimeout(()=>{
                view_end();}, 600);

        } // if(event.keyCode==32)


        function go(){
            let more=document.querySelector(abutton); // Moreボタン
            if(next==1 && active_check()){
                if(more){
                    monitor2.disconnect();
                    more.click();
                    view_end();
                    senser=0;
                    monitor2.observe(target2, {childList: true, subtree: true}); }}}


        function stop(){
            if(senser>8){
                next=0;
                senser=0;
                clearInterval(interval);
                view_end();
                act(1);
                list_end(); }}


        function view_end(){
            let list_body=document.querySelector(ascroll_box +' tbody');
            if(list_body && active_check()){
                let bottom=list_body.scrollHeight - list_body.clientHeight;
                list_body.scroll(0, bottom); }}


        function active_check(){
            let iine_Mask=document.querySelector('#iineEntryListMask');
            if(iine_Mask){
                if(iine_Mask.classList.contains('hide')){
                    return true; }
                else{
                    return false; }}}


        function list_end(){
            let sc_box=document.querySelector(ascroll_box);
            let more=document.querySelector(abutton);
            if(sc_box && !more){
                beep();
                sc_box.classList.add('listend'); }}


        function act(n){
            let action=document.querySelector('#action');
            if(action){
                if(n==0){
                    action.disabled=true; }
                else{
                    action.disabled=false; }}}

    } // auto_scroll()
} //end_more()




/* ======== ダイアログ内のリストの自動スクロール =====================*/

let target3=document.body; // 監視 target3
let monitor3=new MutationObserver(dialog);
monitor3.observe(target3, { childList: true }); // 監視開始


function dialog(){

    smart();


    let header=document.querySelector('#iineEntryHeader');
    let header_count=document.querySelector('#iineEntryHeader .tx_orageA');
    let header_link=document.querySelector('#iineEntryHeader a');

    if(header_link){
        header_link.setAttribute('target', '_blank');
        header_link.onclick=function(event){
            event.stopImmediatePropagation(); }}

    if(header && header_link){
        header.style.background='#f7f7f7';
        header_link.style.color='#06c';
        header_link.style.pointerEvents='auto';
        header_count.style.color="red"; }


    monitor3.disconnect();
    end_more_dia();
    monitor3.observe(target3, {childList: true, subtree: true}); // 監視開始

} // blocker_dia_g()



function smart(){
    let headerT=document.querySelector('#iineEntryHeader p');
    if(headerT){
        headerT.style.background='none';
        headerT.style.fontSize='0';
        headerT.style.padding='10px 30px 8px 0';
        let title=headerT.querySelector('#iineEntryHeader .tx_bold');
        if(title){
            title.style.fontSize='14px';
            title.style.padding='0 1em 0 0'; }
        let count=headerT.querySelector('#iineEntryHeader .tx_orageA');
        if(count){
            count.style.fontSize='14px';
            count.style.fontWeight='bold'; }}

} // smart()



function end_more_dia(){
    setTimeout(()=>{
        let more=document.querySelector('#moreLinkBtm');
        let item=document.querySelectorAll('#iineEntryContents li');
        if(more && item.length<43){ // リストを可能なら52行まで開く 🔴🔴
            more.click();
        }}, 100);

} //end_more_dia()
