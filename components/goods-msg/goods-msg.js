const { config } = getApp();

Component({
  options: {
    multipleSlots: true       // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object,             // 数据

    // 是否显示checkBox   默认不显示：false 
    checkBox: {
      type: Boolean,
      value: false
    },

    // 是否显示付款状态 eg:待付款 ， 待收货
    status: {
      type: Boolean,
      value: false
    },

    // 显示数字样式   num: 数字   btn：按钮
    numType: {
      type: String,
      value: 'num'
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    host: config.host,
    texts: config.order_status, // 状态
    btns: config.btns,          // 按钮状态
    store_ids: [],              // 选中的店铺id
    ids: [],                    // 选中的商品
    id_info: {                  // 留言
      /*
        cid: leave_word         // cid: 留言
      */
    },                    
    total: {
      'silver_price': 0,        // a类
      'price': 0                // b类
    },  
    freight: 0,                 // 运费
  },

  attached: function (e) {
    let { item, total} = this.data;

    for (let goods of item.goods_info) {
      if (goods.goods_type == -1) {   // b类
        total['silver_price'] += +goods.price
      } else {
        total['price'] += +goods.silver_price
      }     
    }

  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 商品数量操作
    setGoodsNum: function (event) {
      let num = event.currentTarget.dataset.num;
    },

    // 单个选择
    checked: function (e) {
      let { item, ids, store_ids } = this.data;
      let { store_id } = e.currentTarget.dataset;// 店铺id
      let { value } = e.detail;   // 商品id数组

      for (let val of item) {
        if (val.id == store_id) {
          let { data } = val;

          for (let goods of data) {
            // 没有选中任何商品
            if (value.length == 0) {
              goods.checked = false;
              continue;
            }

            for (let id of value) {
              if (goods.id == id) {
                ids.push(id);
                goods.checked = true;
                break;
              } else {
                goods.checked = false;
                ids = app.arrayRemove(ids, id);
              }
            }
          }

          val.checked = value.length >= data.length ? true : false;
          val.checked ? store_ids.push(val.id) : (store_ids = app.arrayRemove(store_ids, val.id))
        }
      }

      this.setData({
        item: item
      })
    },

    // 店铺全选按钮
    checkAll: function (e) {
      let { item } = this.data;
      let check = e.detail.value[0] ? true : false;
      let id = e.currentTarget.dataset.id;//  商铺id
      let { ids, store_ids } = this.data;
      check ? store_ids.push(id) : (store_ids = app.arrayRemove(store_ids, id))

      for (let val of item) {
        if (val.id == id) {
          let { data } = val;
          for (let goods of data) {
            goods.checked = check;

            check ? ids.push(goods.id) : (ids = app.arrayRemove(ids, goods.id))
          }

          val.checked = check;
        }
      }

      this.setData({
        item: item,
        ids: ids
      })
    },

    getIds: function () {
      this.triggerEvent('getIds', {
        ids: this.data.ids,
        store_ids: this.data.store_ids
      })
    },

    getBtn: function (e) {
      let { key, store_id } = e.currentTarget.dataset;
      let item = this.data.item;
      let goods_ids = [];

      for (let store of item) {
        if (store.id == store_id) {
          let { data } = store;

          for (let goods of data) {
            goods.checked && goods_ids.push(goods.id);
          }
        }
      }

      this.triggerEvent('getBtn', {
        goods_ids,
        store_id,
        key // 按钮状态
      })
    },

    getMsg: function() {
      
    }
  }
});
