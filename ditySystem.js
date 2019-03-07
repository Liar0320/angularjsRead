//first;     // 执行每个watch  listener
(()=>{
    console.log("First Scope ---------------\n");
    function Scope() {
        this.$$watchList = [];
    }
    
    //在Angular框架中，双美元符前缀$$表示这个变量被当作私有的来考虑，不应当在外部代码中调用。
    
    Scope.prototype.$watch = function (name,getNewValue,listener) {
        var watch = {
            name:name,
            getNewValue:getNewValue,
            listener:listener || function(){}
        }
        this.$$watchList.push(watch);
    }
    
    Scope.prototype.$digest = function () {
        this.$$watchList.forEach(item => item.listener());
    }
    
    var $scope = new Scope();
    $scope.$watch('apple',function () {
        console.log('apple');
    },function () {
        console.log('apple listener');
    })
    
    $scope.$watch('banana',function () {
        console.log('banana');
    },function () {
        console.log('banana listener');
    })
    
    $scope.$digest()

    console.log("\n---------------  First Scope End  \n\n");
})();


//second;       //比较新旧值  在执行listener
(()=>{
    console.log(" Second Scope --------------- \n");
    function Scope() {
        this.$$watchList = [];
    }
    //在Angular框架中，双美元符前缀$$表示这个变量被当作私有的来考虑，不应当在外部代码中调用。

    Scope.prototype.$watch = function (name,getNewValue,listener) {
        var watch = {
            name:name,
            getNewValue:getNewValue,
            listener:listener || function(){}
        }
        this.$$watchList.push(watch);
    }
    
    Scope.prototype.$digest = function () {
        this.$$watchList.forEach(watch => {
            let newValue = watch.getNewValue(watch.name);
            let oldValue = watch.last;
            if(newValue !== oldValue){
                watch.listener(newValue,oldValue,watch);
            }
            watch.last = newValue;
        });
    }
    
    var $scope = new Scope();
    
    var getNewValue = function  () {
        return $scope[this.name]
    };
    
    
    $scope.$watch('apple',getNewValue,function (newValue,oldValue,scope) {
        console.log('apple listener',newValue,oldValue);
    })
    
    $scope.$watch('banana',getNewValue,function (newValue,oldValue,scope) {
        $scope['apple'] = '被 banana占领了';
        console.log('banana listener',newValue,oldValue);
    })
    $scope['apple'] = 'apple';
    $scope['banana'] = 'banana';    
    $scope.$digest();
    console.log("\n---------------   Second Scope End \n\n");
})();


//thrid:       如果在脏检查的时候 改变了需要监听的值  
(()=>{
    console.log("Third Scope --------------- ");
    function Scope() {
        this.$$watchList = [];
    }
    //在Angular框架中，双美元符前缀$$表示这个变量被当作私有的来考虑，不应当在外部代码中调用。

    Scope.prototype.$watch = function (name,getNewValue,listener) {
        var watch = {
            name:name,
            getNewValue:getNewValue,
            listener:listener || function(){}
        }
        this.$$watchList.push(watch);
    }
    
    Scope.prototype.$digest = function () {
        let dirty = true;
        while(dirty){
            dirty = this.$$digestOnce();
        }
    }

    Scope.prototype.$$digestOnce = function () {
        var dirty = false;
        this.$$watchList.forEach(watch => {
            let newValue = watch.getNewValue(watch.name);
            let oldValue = watch.last;
            if(newValue !== oldValue){
                watch.listener(newValue,oldValue,watch);
                dirty = true;
            }
            watch.last = newValue;
        });
        return dirty;
    }
    
    
    var $scope = new Scope();
    
    var getNewValue = function  () {
        return $scope[this.name]
    };
    
    
    $scope.$watch('apple',getNewValue,function (newValue,oldValue,scope) {
        // $scope['banana'] = '被 apple占领了';
        console.log('apple listener',newValue,oldValue);
    })
    
    $scope.$watch('banana',getNewValue,function (newValue,oldValue,scope) {
        $scope['apple'] = '被 banana占领了';
        console.log('banana listener',newValue,oldValue);
    })
    
    $scope['apple'] = 'apple';
    $scope['banana'] = 'banana';    
    $scope.$digest();
    console.log("\n--------------- Third Scope End  \n\n");
})();


//fourth:       如果在脏检查的时候 改变了需要监听的值  并且 两个监听器循环改变
(()=>{
    console.log("Fourth Scope --------------- ");
    function Scope() {
        this.$$watchList = [];
    }
    //在Angular框架中，双美元符前缀$$表示这个变量被当作私有的来考虑，不应当在外部代码中调用。

    Scope.prototype.$watch = function (name,getNewValue,listener) {
        var watch = {
            name:name,
            getNewValue:getNewValue,
            listener:listener || function(){}
        }
        this.$$watchList.push(watch);
    }
    
    Scope.prototype.$digest = function () {
        let dirty = true;
        let MAXTIMES = 10;
        let times = 0;
        while(dirty){
            dirty = this.$$digestOnce();
            times++;
            if(times === MAXTIMES && dirty) {
                throw new Error("已经超出十次循环");
            }
        }
    }

    Scope.prototype.$$digestOnce = function () {
        var dirty = false;
        this.$$watchList.forEach(watch => {
            let newValue = watch.getNewValue(watch.name);
            let oldValue = watch.last;
            if(newValue !== oldValue){
                watch.listener(newValue,oldValue,watch);
                dirty = true;
            }
            watch.last = newValue;
        });
        return dirty;
    }
    
    var $scope = new Scope();
    
    var getNewValue = function  () {
        return $scope[this.name]
    };
    
    
    $scope.$watch('apple',getNewValue,function (newValue,oldValue,scope) {
        $scope['banana']++;
        console.log('apple listener',newValue,oldValue);
    })
    
    $scope.$watch('banana',getNewValue,function (newValue,oldValue,scope) {
        $scope['apple']++;
        console.log('banana listener',newValue,oldValue);
    })
    
    $scope['apple'] = 0;
    $scope['banana'] = 1;    
    $scope.$digest();
    console.log("\n--------------- Fourth Scope End  \n\n");
})();

//了解脏检机制
//ps : https://www.cnblogs.com/likeFlyingFish/p/6183630.html
