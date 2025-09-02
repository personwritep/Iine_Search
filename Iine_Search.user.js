// ==UserScript==
// @name        Iine Search
// @namespace        http://tampermonkey.net/
// @version        0.4
// @description        「いいね！された記事」の過去のアクション検索
// @author        Ameba Blog User
// @match        https://blog.ameba.jp/ucs/iine/list.html
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameba.jp
// @grant        none
// @updateURL        https://github.com/personwritep/Iine_Search/raw/main/Iine_Search.user.js
// @downloadURL        https://github.com/personwritep/Iine_Search/raw/main/Iine_Search.user.js
// ==/UserScript==



nav();

function nav(){
    let nav_box=
        '<div id="navbox">'+
        '<button id="set_id">検索対象のIDを設定</button>'+
        '<div id="search_id_box">未設定</div>'+
        '<button id="action">検索を開始する</button>'+
        '<div id="support">'+
        '⚠️ 検索対象が未設定です\n\n'+
        '検索を機能させるには、検索対象のユーザーIDの設定が必要です'+
        '</div>'+
        '</div>'+
        '<style>'+
        '#navbox { position: fixed; top: 80px; left: 20px; z-index: 9500; '+
        'font: normal 16px meiryo; color: #000; width: 280px; padding: 20px; '+
        'border: 1px solid #888; border-radius: 4px; '+
        'background: #5bb4d8; box-shadow: 0 20px 100px 0 #00000042; }'+
        '#set_id, #action { font: normal 16px Meiryo; margin: 0; padding: 10px 16px 8px; '+
        'background: #e4faff; border: 1px solid #888; border-radius: 4px; cursor: pointer; } '+
        '#search_id_box { height: 24px; margin: 10px 0 20px; padding: 3px 12px 1px; '+
        'border: 1px solid #888; border-radius: 4px; background: #fff; '+
        'white-space: nowrap; overflow-x: scroll; scrollbar-width: none; } '+
        '#support { min-height: 47px; margin: 40px 0 0; padding: 16px 12px 13px; '+
        'white-space: break-spaces; border-radius: 4px; background: #fff; } '+

        '.done { box-shadow: 4px 0 0 0 #fff, 16px 0 0 -1px #2196f3; } '+
        '<style>';

    if(!document.querySelector('#navbox')){
        document.body.insertAdjacentHTML('beforeend', nav_box); }

    let navbox=document.querySelector('#navbox');

} // nav(ask)




let drive_mode; // ページ更新時の動作モード
let search_id; // 検索対象のユーザーID
let search_id_able=0; // ID設定可能な状態

let list_bar; // 記事リストに読込んだ記事行の配列
let next_target; // ページ内の次の対象記事
let action;


drive_mode='s'

control_pannel();

function control_pannel(){

    let set_id=document.querySelector('#navbox #set_id');
    if(set_id){
        set_id.addEventListener('click', function(event){
            event.preventDefault();
            get_id(); }); }


    action=document.querySelector('#navbox #action');
    action.addEventListener('click', function(event){
        event.preventDefault();
        start_stop(); }); // 常にページの途中から連続処理スタート



    function start_stop(){
        if(drive_mode=='s'){
            let str=
                '🔴 ダイアログ検索を開始します\n\n'+
                '▶ リストの行を「Ctrl+Click」\n'+
                '　 その行以降の検索を開始します\n\n'+
                '▶「一旦停止 ❚❚」ボタンを押すと\n'+
                '　 検索停止 / 検索再開 ができます';
            support(str);
            drive_mode='c'; // ページ内の連続処理
            action.textContent='　検索を一旦停止　❚❚';
            clicked_item(); }

        else if(drive_mode=='c'){ // 連続動作状態の場合
            drive_mode='p'; // クリックされたら「p」停止モード
            action.textContent='　検索を再開する　▶';
            un_dark(); }

        else if(drive_mode=='p'){ // 動作停止状態の場合
            drive_mode='c'; // クリックされたら連続動作を再開
            action.textContent='　検索を一旦停止　❚❚';
            open_dialog(next_target); }

        function clicked_item(){
            list_bar=document.querySelectorAll('.tableList .iineEntryCnt');
            for(let k=0; k<list_bar.length; k++){
                list_bar[k].onclick=function(event){
                    if(event.ctrlKey){
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        disable_set_id();
                        open_dialog(k); }}}}

    } // start_stop()

} // control_pannel()



function open_dialog(k){

    next_target=k; // 送信完了までは未処理とする

    if(drive_mode=='c'){

        async_task();

        function async_task(){
            list_bar[k].classList.add('done'); // リストに青バーを表示

            list_bar[k].click();

            setTimeout(()=>{
                clear_frame();
            }, 100);

            setTimeout(()=>{
                if(search_who()){
                    drive_mode='p'; //「p」停止モード 再検索可能
                    action.textContent='　検索を再開する　▶';
                    end_target(); }
                else{
                    let iCB=document.querySelector('#iineCloseBtn');
                    if(iCB){
                        iCB.click(); }
                    dark();
                    end_target(); } // 終了後に次の行へ移行

            }, 2000); // リストのロードタイミング

        } // async_task()



        function search_who(){
            let iLI=document.querySelectorAll('.iineListItem a');
            for(let i=0; i<iLI.length; i++){
                let link=iLI[i].getAttribute('href');
                if(link){
                    if(link.includes(search_id)){
                        iLI[i].style.outline='2px solid red';
                        iLI[i].style.outlineOffset='6px';
                        iLI[i].scrollIntoView({block: "center"});
                        return true; }}}

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
                    setTimeout(()=>{
                        drive_mode='s'; //「s」停止モード 再検索可能
                        action.textContent='　検索を再開する　▶';
                        let str=
                            '⛔  リスト末尾まで検索しました\n\n'+
                            '「Space」キーを押して更に過去のリストを読み込み、調査範囲を拡げて検索を再開できます';
                        support(str);
                        un_dark();
                    },200);
                }}

        } // end_target()

    } // if(drive_mode=='c')

} // open_dialog()



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





/* ======== 履歴リスト全体の自動スクロール =========================*/

let target0=document.head; // 監視 target
let monitor0=new MutationObserver(end_more);
monitor0.observe(target0, { childList: true }); // 監視開始

end_more();

function end_more(){
    let senser=0;
    let next=0;
    let interval;

    let list_frame=document.querySelector('#iineHistoryContent');
    if(list_frame){
        let style=
            '<style id="imute_style_r">'+
            '#iineHistoryContent table { position: relative; } '+
            '#iineHistoryContent tbody { overflow-y: scroll; margin-top: 34px; '+
            'height: calc( 100vh - 220px); border-bottom: 1px solid #ccc; display: block; '+
            'padding-right: 12px; } '+
            '.tableList th { width: inherit; font-size: 14px; padding: 8px 4px 6px; '+
            'text-align: center !important; background: #f4f4f4; } '+
            '#iineHistoryContent tr:first-child { position: absolute; z-index: 1; width: 786px; '+
            'top: 1px; left: -1px; border-left: 1px solid #ccc; border-right: 1px solid #ccc; } '+
            '#ucsMain #moreLoading { margin: -3px auto; } '+
            '#iineHistoryUserFrame .tableList th.rightCell { width: 200px; } '+
            '#ucsMain .moreLinkBottom span { '+
            'background-position: 0 4px; font-size: 14px; } '+
            '#iineHistoryEntryFrame:after, #iineHistoryUserFrame:after { '+
            'content: "▢ Space: 連続スクロール / 停止"; '+
            'position: absolute; right: 10px; margin: 0; border: 1px solid #aaa; '+
            'padding: 3px 12px 1px; font: bold 14px Meiryo; color: #888; background: #fff; } ' +

            '.mask { opacity: 0.6; } '+
            '#iineEntryFrame { position: fixed; top: 8px !important; } '+
            '#iineEntryHeader .iineListHeaderText { white-space: nowrap; overflow-x: scroll; '+
            'scrollbar-width: none; } '+
            '#iineEntryContents { max-height: unset !important; height: calc(100vh - 56px); '+
            'background: cadetblue; scrollbar-width: none; } '+
            '.iineListItem { background: #d5e7ed; } '+
            '.iineListItem a { pointer-events: none; } '+
            '#moreLinkBtm { visibility: hidden; } '+

            '#footerAd, #globalFooter { display: none; } '+
            'html { overflow: hidden; } '+
            'html.noscroll { padding-right: 0 !important; } '+
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
                next=1;
                interval=setInterval(
                    function(){
                        go();
                        stop();
                        senser+=1;
                    }, 500); }
            else{
                next=0;
                clearInterval(interval); }

            setTimeout(()=>{
                view_end();}, 600); } // リスト末尾を表示


        function go(){
            let more=document.querySelector(abutton); // Moreボタン
            if(more && next==1 && active_check()){
                monitor0.disconnect();
                more.click();
                view_end();
                senser=0;
                monitor0.observe(target0, {childList: true, subtree: true}); }}

        function stop(){
            if(senser>8){
                next=0;
                senser=0;
                clearInterval(interval);
                view_end(); }}

        function view_end(){
            let list_body=document.querySelector(ascroll_box +' tbody');
            if(list_body && active_check()){
                list_body.scrollBy(0, 1000); }}

        function active_check(){
            let iine_Mask=document.querySelector('#iineEntryListMask');
            let mask=window.getComputedStyle(iine_Mask).getPropertyValue('display');
            if(mask=='block'){
                return false; }
            else{
                return true; }}

    } // auto_scroll()

} //end_more()




/* ======== ダイアログ内のリストの自動スクロール =====================*/

let target2=document.body; // 監視 target
let monitor2=new MutationObserver(dialog);
monitor2.observe(target2, { childList: true }); // 監視開始


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


    monitor2.disconnect();
    end_more_dia();
    monitor2.observe(target2, {childList: true, subtree: true}); // 監視開始

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
    let senser=0;
    let next=0;
    let interval;
    let list_body;

    setTimeout(()=>{
        let more=document.querySelector('#moreLinkBtm');
        let item=document.querySelectorAll('#iineEntryContents li');
        if(more && item.length<43){ // リストを可能なら52行まで開く 🔴🔴
            more.click();
        }}, 100);


    document.addEventListener('keydown', function(event){
        if(event.keyCode==32){
            event.preventDefault();
            event.stopImmediatePropagation();

            list_body=document.querySelector('#iineEntryContents'); // scroll要素
            if(list_body){
                list_body.style.maxHeight='80vh'; }

            if(next==0 && active_check()){
                next=1;
                interval=setInterval(
                    function(){
                        go();
                        stop();
                        senser+=1;
                    }, 500); }
            else{
                next=0;
                clearInterval(interval); }
            setTimeout(()=>{
                view_end(); }, 600); } // リスト末尾を表示

        function go(){
            let more=document.querySelector('#moreLinkBtm.moreBtm span'); // Moreボタン
            if(more && next==1 && active_check()){
                more.click();
                senser=0; }}

        function stop(){
            if(senser>4){
                next=0;
                senser=0;
                clearInterval(interval);
                hide_disp(); }}

        function hide_disp(){
            view_end(); }});

    function view_end(){
        let list_body=document.querySelector('#iineEntryContents');
        if(list_body && active_check()){
            list_body.scrollBy(0, 1000); }}

    function active_check(){
        let iine_Mask=document.querySelector('#iineEntryListMask');
        if(iine_Mask){
            let mask=window.getComputedStyle(iine_Mask).getPropertyValue('display');
            if(mask=='block'){
                return true; } // いいね履歴 ブログページでON
            else{
                return false; }} // いいね履歴 ブログページでOFF
        else{
            return true; }} // 管理トップでは 常にON

} //end_more_dia()





/* ======== 検索対象のユーザーIDを取得 ===========================*/


function support(str){
    let support=document.querySelector('#support');
    if(support){
        support.textContent=str; }}



function disable_set_id(){
    search_id_able=0;
    support('　'); }



function get_id(){
    search_id_able=1;

    let iine_Mask=document.querySelector('#iineEntryListMask');
    if(iine_Mask){
        let monitor1=new MutationObserver(get);
        monitor1.observe(iine_Mask, { attributes: true });

        get();

        function get(){
            setTimeout(()=>{
                if(search_id_able==1){
                    let iLI=document.querySelectorAll('.iineListItem a');
                    if(iLI.length==0){
                        let ask=
                            '検索するユーザーを設定するには\n\n'+
                            '❶ 検索対象を含む記事をクリック\n'+
                            '　 その記事のダイアログを開く\n\n'+
                            '❷ 検索対象の行をクリックする';
                        support(ask); }
                    else{
                        get_item(); }
                }
            }, 200); // リストロードのタイミング


            function get_item(dia){
                document.addEventListener('click', function(event){
                    if(search_id_able==1){
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        let elem=document.elementFromPoint(event.clientX, event.clientY);
                        if(elem){
                            let list_elem=elem.closest('li');
                            if(list_elem.classList.contains('iineListItem')){
                                get(list_elem); }}}});

                function get(target){
                    let link=target.querySelector('a');
                    if(link){
                        let link_href=link.getAttribute('href');
                        if(link_href){
                            let part=link_href.split('/');
                            search_id=part[part.length-2];
                            let search_id_box=document.querySelector('#search_id_box');
                            if(search_id_box){
                                search_id_box.textContent=search_id;
                                clear_line();
                                target.style.outline='2px solid #2196f3';
                                target.style.outlineOffset='-3px';
                                disable_set_id();
                                monitor1.disconnect(); }}}}

                function clear_line(){
                    let item=document.querySelectorAll('#iineEntryListFrame .iineListItem');
                    for(let k=0; k<item.length; k++){
                        item[k].style.outline=''; }}

            } // get_item(dia)

        } // get()

    } // iine_Mask

} // get_id()
