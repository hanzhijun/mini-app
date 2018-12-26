// components/radio-box/radio-box.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Array
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    radioChange: function (e) {
      this.triggerEvent('value', e.detail);
    }
  }
})
