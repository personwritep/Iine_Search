// ==UserScript==
// @name        Iine Search
// @namespace        http://tampermonkey.net/
// @version        0.1
// @description        「いいね！された記事」の過去のアクション検索
// @author        Ameba Blog User
// @match        https://blog.ameba.jp/ucs/iine/list.html
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameba.jp
// @grant        none
// @updateURL        https://github.com/personwritep/Iine_Search/raw/main/Iine_Search.user.js
// @downloadURL        https://github.com/personwritep/Iine_Search/raw/main/Iine_Search.user.js
// ==/UserScript==



let user_id=""; // 検索対象のUserIDを記入します 🔴🔴🔴🔴

let slow_open;
let order=0;
let stop;


document.addEventListener('keyup', (event)=>{
    if(event.keyCode==120){
        event.preventDefault();
        event.stopImmediatePropagation();
        if(event.shiftKey || event.ctrlKey){ //「Ctrl+F9」または「Shift+F9」の押下
            stop=1;
            un_dark(); }
        else{ //「F9」キーのみ押下
            open_all(); }} //「F9」入力
});



function dark(){
    let iELM=document.querySelector('#iineEntryListMask');
    if(iELM){
        iELM.classList.remove('hide'); }}


function un_dark(){
    let iELM=document.querySelector('#iineEntryListMask');
    let iEF=document.querySelector('#iineEntryFrame');
    if(iELM && iEF){
        if(iEF.clientHeight==0){
            iELM.classList.add('hide'); }}}



function open_all(){
    let iCB=document.querySelector('#iineCloseBtn');
    let cnt=document.querySelectorAll('.iineEntryCnt');

    stop=0;
    iCB.click();
    dark();

    let slow_open=setInterval(work, 2000);

    function work(){
        if(stop==0){
            cnt[order].click(); }

        setTimeout(()=>{
            stop=search_who();
        }, 1200);

        setTimeout(()=>{
            if(stop==0){
                iCB.click();
                dark(); }
        }, 1600);

        if(order>cnt.length || stop==1){
            clearInterval(slow_open);
            order -=1; }

        order +=1;

    } // work()



    function search_who(){
        let get=0;
        let iLI=document.querySelectorAll('.iineListItem a');
        for(let i=0; i<iLI.length; i++){
            let link=iLI[i].getAttribute('href');
            if(link){
                if(link.includes(user_id)){
                    iLI[i].style.outline='2px solid red';
                    iLI[i].style.outlineOffset='6px';
                    iLI[i].scrollIntoView();
                    get=1; }}}

        return get;

    } // search_who()

} // open_all()
