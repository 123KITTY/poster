function init (){
    this.canvas=document.getElementById("poster");
    this.ctx = this.canvas.getContext("2d");
    this.log = document.querySelector("#log");
    this.draw_bg();
}
init.prototype.isMobile = function() {
    return /Android|webOS|iPhone|iPod|ipad|BlackBerry/i.test(navigator.userAgent) ? true : false;
}
init.prototype.highQulity = function(){
    this.ctx.mozImageSmoothingEnabled = true;
    this.ctx.webkitImageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
    this.ctx.msImageSmoothingEnabled = true;
    this.ctx.imageSmoothingEnabled = true;
}
//绘制背景图片
init.prototype.draw_bg= function(){
    this.img=new Image()
    this.img.src="../images/bg.png"
    this.img.onload = ()=>{
        this.setDrawSize();
        this.canvas.height= this.draw_h;
        this.canvas.width= this.draw_w;
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.highQulity();
        this.ctx.drawImage(this.img,0,0,this.draw_w,this.draw_h);
    }
}
// 假设 上传从文件夹中选择了图片 TODO:上传接口
init.prototype.draw_pic = function(){
    let that = this;
    this.config = {
        width : this.canvas.width,        // 设置canvas的宽
        height : this.canvas.height,        // 设置canvas的高
        imgSrc : this.imgSrc,    // 图片路径
        maxScale : 4.0,        // 最大放大倍数
        minScale : 0.2,        // 最小放大倍数
        step : 0.1           // 每次放大、缩小 倍数的变化值
    };
    
    this.isMove = false;// 标记是否移动事件
    
    this.imgStatus = {
        'scale' : 1.0,
        'rotate' : 0
    };
    this.lastStatus = {};
    this.currentStatus = {};
    this.pic = new Image();
    this.pic.src = this.config.imgSrc;
    this.pic.onload = () =>{
        this.lastStatus = {
            "imgX" : -1 * that.pic.width / 2,
            "imgY" : -1 * that.pic.height / 2,
            'mouseX' : 0,
            'mouseY' : 0,
            'translateX' : that.canvas.width / 2,
            'translateY' : that.canvas.height /2,
            'scale' : 1.0,
            'rotate' : 0
        };
        this.drawImgByStatus(this.canvas.width / 2, this.canvas.height / 2);
    };
    if(this.isMobile()){
        this.registerEvent_mobile();
    }else{
        this.registerEvent_pc();
    }
}
//背景图片大小
init.prototype.setDrawSize = function(){
    // 图片宽度 手机宽度，高度不变 保持水平垂直    居中。
    //如果图片宽度 小于 手机宽度 ： 图片宽度不变，
    //如果 比例高度 小于等于 手机高度 && 小于等于图片高度，高度为比例高度 ；如果比例高度 大于 手机高度 且 大于 图片高度 则图片高度 = 等于手机高度 宽度为比例宽度 ：保持水平垂直居中。
    let win_w = window.innerWidth;
    let win_h = window.innerHeight;
    let img_w = this.img.width;
    let img_h = this.img.height;
    let scale_value = win_w/img_w;//缩放比例
    let scale_h = win_h/scale_value;//比例高度
    let draw_h;
    let draw_w;
    if (img_w >= win_w) {
        draw_w = win_w; 
        if(img_h <= scale_h){
            draw_h = img_h;
        }else{
            draw_h = scale_h;
        }
    }else{
        draw_w = img_w;
    }
    if (img_h<=win_h) {
        draw_h = img_h;
    }else{
        draw_h = win_h;
        if (img_w >= win_w) {
            draw_w = win_w;
        }else{
            draw_w = img_w;
        }
    }
    
    this.draw_w = draw_w;
    this.draw_h = draw_h;
}
init.prototype.logEvent = function(str) {
    this.log.insertBefore(document.createTextNode(str +"\n"), log.firstChild);
    console.log(str)
}
init.prototype.registerEvent_mobile = function(){
    // this.hammer = new Hammer(this.canvas);
    // this.hammer.on('press', function(e) {
    //   e.target.classList.toggle('expand');
    //   console.log("You're pressing me!");
    //   console.log(e);
    // });
    let that = this;
    var el = this.canvas;
    var reqAnimationFrame = (function () {
        return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    // var el = document.querySelector("#hit");
    var START_X = Math.round((window.innerWidth - el.offsetWidth) / 2);
    var START_Y = Math.round((window.innerHeight - el.offsetHeight) / 2);
    var ticking = false;
    var transform;
    var timer;
    var mc = new Hammer.Manager(el);
    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    // mc.add(new Hammer.Swipe()).recognizeWith(mc.get('pan'));
    mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(mc.get('pan'));
    mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')]);
    // mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
    // mc.add(new Hammer.Tap());
    mc.on("panstart panmove panend", onPan);
    // mc.on("rotatemove", onRotate);
    mc.on("pinchstart pinchin pinchout", onPinch);
    // mc.on("swipe", onSwipe);
    // mc.on("tap", onTap);
    // mc.on("doubletap", onDoubleTap);
    mc.on("hammer.input", function(ev) {
        if(ev.isFinal) {
            // resetElement();
        }
    });
    function resetElement() {
        // el.className = 'animate';
        transform = {
            translate: { x: START_X, y: START_Y },
            scale: 1,
            angle: 0,
            rx: 0,
            ry: 0,
            rz: 0
        };
        requestElementUpdate();
        // if (log.textContent.length > 2000) {
        //     log.textContent = log.textContent.substring(0, 2000) + "...";
        // }
    }
    function updateElementTransform() {
        var value = [
            'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)',
            'scale(' + transform.scale + ', ' + transform.scale + ')',
            'rotate3d('+ transform.rx +','+ transform.ry +','+ transform.rz +','+  transform.angle + 'deg)'
        ];
        value = value.join(" ");
        // that.logEvent(value)
        // log.textContent = value;
        // el.style.webkitTransform = value;
        // el.style.mozTransform = value;
        // el.style.transform = value;
        ticking = false;
    }
    function requestElementUpdate() {
        if(!ticking) {
            reqAnimationFrame(updateElementTransform);
            ticking = true;
        }
    }
    
    function onPan(ev) {
        // console.log(ev)
            if(ev.center.x){
            if(ev.type=='panstart'){
                let box = that.windowToCanvas(ev.center.x,ev.center.y);
                that.lastStatus.mouseX = box.x;
                that.lastStatus.mouseY = box.y;
                
            }
            if(ev.type=='panmove'){
                let box = that.windowToCanvas(ev.center.x,ev.center.y);
                that.drawImgByMove(box.x, box.y);
            }
        }
        
        // updateElementTransform()
    }
    var initScale = 1;
    var center = that.lastTranslate
    // var center;
    function onPinch(ev) {
        // console.log(this.lastStatus.imgX,x,this.lastStatus.translateX,this.lastStatus.scale)
        // console.log(ev)‘
        // console.log(ev.srcEvent.clientX,ev.srcEvent.clientY)
        if(ev.center.x){
            if(ev.type == 'pinchstart') {
                initScale =  that.lastStatus.scale;
            }
           if (ev.type == 'pinchin' || ev.type == 'pinchout') {
             that.imgStatus.scale = initScale * ev.scale;
                // that.imgStatus.scale = initScale * ev.scale;
                // that.logEvent(JSON.stringify(ev));
                // let box = that.windowToCanvas(center.x + that.lastTranslate.x, center.y + that.lastTranslate.y);
                // that.drawImgByStatus(box.x, box.y);
            }
        }
     
        // if(ev.type == 'pinchmove'){
        // that.logEvent('scale:'+ that.imgStatus.scale)
           
        // }
        // transform.scale = initScale * ev.scale;
        // if(ev.type == 'pinchmove'){
        
        // let box = that.windowToCanvas(ev.center.x,ev.center.y);
        // that.drawImgByStatus(box.x, box.y);
        // log.textContent = box.x + ',' + box.y;
        // that.imgStatus.scale = ev.scale// + that.imgStatus.scale

        // }
        // that.imgStatus.rotate = 
        // let mXY = that.windowToCanvas(ev.center.x,ev.center.y);
        // that.drawImgByStatus(mXY.x, mXY.y);
        // log.textContent = ev.scale;

        // log.textContent = JSON.stringify(ev.srcEvent) ;
        // updateElementTransform()
    }
    // var initAngle = 0;
    // function onRotate(ev) {
    // if(ev.center.x){

    //     if(ev.type == 'rotatestart') {
    //         initAngle = transform.angle || 0;
    //         // let box = that.windowToCanvas(ev.center.x,ev.center.y);
    //         // that.lastStatus.mouseX = box.x;
    //         // that.lastStatus.mouseY = box.y;
    //     }
    //     if(ev.type == 'rotatemove' ){
    //             transform.angle = initAngle + ev.rotation;
    //             that.imgStatus.rotate = transform.angle
    //             let mXY = that.windowToCanvas(ev.center.x,ev.center.y);
    //             that.drawImgByStatus(mXY.x, mXY.y,ev.type);
    //         }
    //     }
    //     // el.className = '';
    //     // requestElementUpdate();
    //     // logEvent(ev.type);
    // }
    // function onSwipe(ev) {
    //     var angle = 50;
    //     transform.ry = (ev.direction & Hammer.DIRECTION_HORIZONTAL) ? 1 : 0;
    //     transform.rx = (ev.direction & Hammer.DIRECTION_VERTICAL) ? 1 : 0;
    //     transform.angle = (ev.direction & (Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_UP)) ? angle : -angle;
    //     clearTimeout(timer);
    //     timer = setTimeout(function () {
    //         resetElement();
    //     }, 300);
    //     requestElementUpdate();
    //     logEvent(ev.type);
    // }
    // function onTap(ev) {
    //     transform.rx = 1;
    //     transform.angle = 25;
    //     clearTimeout(timer);
    //     timer = setTimeout(function () {
    //         resetElement();
    //     }, 200);
    //     requestElementUpdate();
    //     logEvent(ev.type);
    // }
    // function onDoubleTap(ev) {
    //     transform.rx = 1;
    //     transform.angle = 80;
    //     clearTimeout(timer);
    //     timer = setTimeout(function () {
    //         resetElement();
    //     }, 500);
    //     requestElementUpdate();
    //     logEvent(ev.type);
    // }
    // resetElement();
}
init.prototype.registerEvent_pc = function(){
    let that = this;
     this.canvas.onmousedown = function(e){
        that.isMove = true;
        this.style.cursor = "move";
        let box = that.windowToCanvas(e.clientX, e.clientY);
        that.lastStatus.mouseX = box.x;
        that.lastStatus.mouseY = box.y;
    }
    this.canvas.onmouseout = function(e){
        that.isMove = false;
        this.style.cursor = "default";
    }

    this.canvas.onmouseup = function(e){
        that.isMove = false;
        this.style.cursor = "default";
    }
    this.canvas.onmousemove = function(e){
        if(that.isMove) {
            let box = that.windowToCanvas(e.clientX, e.clientY);
            that.drawImgByMove(box.x, box.y);
        }
    }
    this.canvas.onmousewheel = function(e){
        if(e.wheelDelta > 0) {
            that.imgStatus.scale = (that.imgStatus.scale >= that.config.maxScale) ? that.config.maxScale : that.imgStatus.scale + that.config.step;
        } else {
            that.imgStatus.scale = (that.imgStatus.scale <= that.config.minScale) ? that.config.minScale : that.imgStatus.scale - that.config.step;
        }
        let mXY = that.windowToCanvas(e.clientX, e.clientY);
        that.drawImgByStatus(mXY.x, mXY.y);
    }
}
init.prototype.windowToCanvas = function(x, y){
    let box = this.canvas.getBoundingClientRect();
    return {
        'x' : x - box.left,
        'y' : y - box.top
    };
}
init.prototype.drawImgByMove = function(x, y) {
    // this.logEvent(x, y)
    this.lastStatus.translateX = this.lastStatus.translateX + (x - this.lastStatus.mouseX);
    this.lastStatus.translateY = this.lastStatus.translateY + (y - this.lastStatus.mouseY);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    // console.log(this.lastStatus.translateX)
    // console.log(this.lastStatus.translateX, this.lastStatus.translateY)
    // this.lastStatus.translateX = this.lastStatus.translateX > this.lastStatus.img?Math.abs(this.lastStatus.imgX):this.lastStatus.translateX
    // this.lastStatus.translateY = this.lastStatus.translateY > this.lastStatus.imgY?Math.abs(this.lastStatus.imgY):this.lastStatus.translateY
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.lastStatus.translateX, this.lastStatus.translateY);
    this.ctx.rotate(this.imgStatus.rotate * Math.PI / 180);
    this.ctx.scale(this.imgStatus.scale, this.imgStatus.scale);
    this.ctx.drawImage(this.pic, this.lastStatus.imgX, this.lastStatus.imgY, this.pic.width, this.pic.height);
    this.ctx.restore();
    this.ctx.translate(0, 0);
    this.ctx.rotate(0);
    this.ctx.scale(1,1);
    this.ctx.drawImage(this.img,0,0,this.draw_w,this.draw_h);
    this.ctx.restore();
    this.lastStatus.mouseX = x;
    this.lastStatus.mouseY = y;
    this.lastStatus.scale = this.imgStatus.scale;
    this.lastStatus.rotate = this.imgStatus.rotate;
}
init.prototype.drawImgByStatus = function (x, y,type) {

        // this.logEvent(type)
        // this.logEvent(this.lastStatus.imgX)
        // this.logEvent(x)
        // this.logEvent(this.lastStatus.translateX)
        // this.logEvent(this.lastStatus.scale)
        // this.logEvent(JSON.stringify(this.lastStatus))
        let imgX = this.lastStatus.imgX - (x - this.lastStatus.translateX) / this.lastStatus.scale;
        let imgY = this.lastStatus.imgY - (y - this.lastStatus.translateY) / this.lastStatus.scale;
        // this.logEvent(imgX)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(x, y);
        this.ctx.rotate(this.imgStatus.rotate * Math.PI / 180);
        this.ctx.scale(this.imgStatus.scale, this.imgStatus.scale);
        this.ctx.drawImage(this.pic, imgX, imgY, this.pic.width, this.pic.height);
        this.ctx.restore();
        this.ctx.translate(0, 0);
        this.ctx.rotate(0);
        this.ctx.scale(1,1);
        this.ctx.drawImage(this.img,0,0,this.draw_w,this.draw_h);
        this.ctx.restore();
        // let that = this;
        this.lastStatus = {
            'imgX' : imgX,
            'imgY' : imgY,
            'translateX' : x,
            'translateY' : y,
            'scale' : this.imgStatus.scale,
            'rotate' : this.imgStatus.rotate
        };
}
init.prototype.uploadFile = function(){
    let uploadFile = document.getElementById('uploadFile');
    let uploadFileBtn = document.getElementsByClassName('uploadFileBtn')[0];
    let that = this;
    uploadFile.addEventListener('change', function() {
        if(!this.files.length) return
        var file = this.files[0];                
        // 确认选择的文件是图片                
        if(file.type.indexOf("image") == 0) {
            var reader = new FileReader();
            reader.readAsDataURL(file);                    
            reader.onload = function(e) {
                // 图片base64化
                var newUrl = this.result;
                // preview.style.backgroundImage = 'url(' + newUrl + ')';
                that.imgSrc = newUrl
                that.draw_pic();
            };
        }
       uploadFileBtn.classList.add('smallUFBtn')
    })
    let downloadFile = document.getElementById('downloadFile');
    let posterLink = document.getElementById('poster-link');
    let posterImg = document.getElementById('poster-img');
    let saveTip  = document.getElementById('save-tip');
    let timer = null
    downloadFile.addEventListener('click',function(){
        let url = that.canvas.toDataURL("image/png",1);
        posterImg.src = url;
        posterImg.classList.remove('hidden');
        that.canvas.classList.add('hidden');
        downloadFile.classList.add('hidden');
        uploadFileBtn.classList.add('hidden');
        saveTip.classList.remove('hidden')
        clearTimeout(timer)
            timer = setTimeout(()=>{
            saveTip.classList.add('hidden');
        },2000);
    })
}
let poster = new init();
poster.uploadFile()



// var canvas=document.querySelector("#poster");
//             var bg=document.querySelector("img");
//             var bg1=document.querySelectorAll("img")[1];
//             canvas.width=375;
//             canvas.height=667;
//             var content=canvas.getContext("2d");

//      /*绘制多张图片时第一张会被当成背景，下一张图片会折叠在第一张上*/           
//      window.onload=function(){
//           content.drawImage(bg, 10, 10); //以Canvas画布上的坐标(10,10)为起始点，绘制图像
//           content.drawImage(bg1, 20, 20);//以Canvas画布上的坐标(20,20)为起始点，绘制图像
//      }

    // 基础配置
    // var config = {
    //     width : 375,        // 设置canvas的宽
    //     height : 667,        // 设置canvas的高
    //     imgSrc : '../images/baby.jpg',    // 图片路径
    //     maxScale : 4.0,        // 最大放大倍数
    //     minScale : 0.1,        // 最小放大倍数
    //     step : 0.1            // 每次放大、缩小 倍数的变化值
    // };

    // // 标记是否移动事件
    // var isMove = false;
    
    // var imgStatus = {
    //     'scale' : 1.0,
    //     'rotate' : 0
    // };
    // var lastStatus = {};
    // var currentStatus = {};

    // var canvas = document.getElementById("poster");
    // canvas.width = config.width;
    // canvas.height = config.height;
    // var ctx = canvas.getContext("2d");

    // var img = new Image();
    // img.src = config.imgSrc;

    // img.onload = function() {
    //     lastStatus = {
    //         "imgX" : -1 * img.width / 2,
    //         "imgY" : -1 * img.height / 2,
    //         'mouseX' : 0,
    //         'mouseY' : 0,
    //         'translateX' : canvas.width / 2,
    //         'translateY' : canvas.height /2,
    //         'scale' : 1.0,
    //         'rotate' : 0
    //     };
    //     drawImgByStatus(canvas.width / 2, canvas.height / 2);
    // };

    // canvas.onmousedown = function(e) {
    //     isMove = true;
    //     canvas.style.cursor = "move";

    //     var box = windowToCanvas(e.clientX, e.clientY);
    //     lastStatus.mouseX = box.x;
    //     lastStatus.mouseY = box.y;
    // }

    // canvas.onmouseout = function(e) {
    //     isMove = false;
    //     canvas.style.cursor = "default";
    // }

    // canvas.onmouseup = function(e) {
    //     isMove = false;
    //     canvas.style.cursor = "default";
    // }

    // canvas.onmousemove = function(e) {
    //     if(isMove) {
    //         var box = windowToCanvas(e.clientX, e.clientY);
    //         drawImgByMove(box.x, box.y);
    //     }
    // }
    
    // canvas.onmousewheel = function(e) {
    //     if(e.wheelDelta > 0) {
    //         imgStatus.scale = (imgStatus.scale >= config.maxScale) ? config.maxScale : imgStatus.scale + config.step;
    //     } else {
    //         imgStatus.scale = (imgStatus.scale <= config.minScale) ? config.minScale : imgStatus.scale - config.step;
    //     }
    //     var mXY = windowToCanvas(e.clientX, e.clientY);
    //     drawImgByStatus(mXY.x, mXY.y);
    // }

    // function drawImgByMove(x, y) {
    //     lastStatus.translateX = lastStatus.translateX + (x - lastStatus.mouseX);
    //     lastStatus.translateY = lastStatus.translateY + (y - lastStatus.mouseY);
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     ctx.save();
    //     ctx.translate(lastStatus.translateX, lastStatus.translateY);
    //     ctx.rotate(imgStatus.rotate * Math.PI / 180);
    //     ctx.scale(imgStatus.scale, imgStatus.scale);
    //     ctx.drawImage(img, lastStatus.imgX, lastStatus.imgY, img.width, img.height);
    //     ctx.restore();

    //     lastStatus.mouseX = x;
    //     lastStatus.mouseY = y;
    // }
    
    // function drawImgByStatus(x, y) {
    //     var imgX = lastStatus.imgX - (x - lastStatus.translateX) / lastStatus.scale;
    //     var imgY = lastStatus.imgY - (y - lastStatus.translateY) / lastStatus.scale;
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     ctx.save();
    //     ctx.translate(x, y);
    //     ctx.rotate(imgStatus.rotate * Math.PI / 180);
    //     ctx.scale(imgStatus.scale, imgStatus.scale);
    //     ctx.drawImage(img, imgX, imgY, img.width, img.height);
    //     ctx.restore();

    //     lastStatus = {
    //         'imgX' : imgX,
    //         'imgY' : imgY,
    //         'translateX' : x,
    //         'translateY' : y,
    //         'scale' : imgStatus.scale,
    //         'rotate' : imgStatus.rotate
    //     };
    // }

    /**
     * 计算相对于canvas左上角的坐标值
     */
    // function windowToCanvas(x, y) {
    //     var box = canvas.getBoundingClientRect();
    //     return {
    //         'x' : x - box.left,
    //         'y' : y - box.top
    //     };
    // }
