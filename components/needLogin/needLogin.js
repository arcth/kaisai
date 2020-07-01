Component({
    properties: {
      // 这里定义了innerText属性，属性值可以在组件使用时指定
      innerText: {
        type: String,
        value: 'default value',
      }
    },
    data: {
      // 这里是一些组件内部数据
    //   animation:'',
      viewAnimation:null,
      someData: {}
    },
    lifetimes:{
        ready:function(){
            this.animation = wx.createAnimation({
                duration:2000,
                timingFunction:'ease'
            })
            // debugger;
            console.log(22);
            this.showModal();
        }
    },
    
    methods: {
      // 这里是一个自定义方法
      customMethod: function(){},
      showModal:function(){
        //   debugger;
          this.animation.opacity(1).step();
          this.setData({viewAnimation:this.animation.export()});
      }
    }
})