const app = getApp();
Page({

  data: {
    activeIndex: 0,              
    ordering_categoryid: 0,       // 当前分类id
    ordering_dishes_id: 0,        // 当前正在操作菜品
    num: 1,                       // 点餐清单加减默认数字
    showDesc: false,              // 规格弹窗
    showAddCart: false,           // 已加入购物车弹框
    format_img: '',               // 选规格图片
    goods_list: {                 // 菜品列表
      /*
        ordering_dishes_id: {

        }
      */
    }, 
    format_list: {                // 规格列表(不包括口味)
      specifications_len: 0,      
      addishes_len: 0,            
      flavors_len: 0,             
      specifications: {},         // 规格
      addishes: {},               // 加菜
      flavors: {                  // 口味
        /*
          A: [{
            id: 0,
          }]
        */
      }
    },   

    // 选中的规格  处理规格
    check_list: {
      price: 0,
      specifications: [/*id, name*/],       // 规格
      addishes: {                           // 加菜
        /*
          id: [true, name]
        */
      },          
      flavors: {                            // 口味
        /*
          A: name
        */
      }
    },

    shopcart: {                                             // 购物车
      /*
        菜品分类id_菜品id_规格_加菜1_加菜2: {
          dishes_name: '',                                  菜品名字
          dishes_picture: '',                               菜品图片
          category_id: '',                                  菜品分类id
          category_name: '',                                菜品分类
          specificationsid: '',                             规格id  
          specification_name: '',                           规格名称
          adddish_id: [],                                   加菜id(arr)
          adddish_name: [],                                 加菜名称(arr)
          flavor_name: [],                                  口味名称(arr)
          dishes_num: '',                                   菜品数量
          dishes_price: '',                                 菜品价格
          in_total: '',                                     菜品小计  
          remakers: ''                                      备注
          flavor_id: []                                     口味id（arr）
        }
      */
    },
    shopcart_len: 0,                  // 购物车数量
    total_price: 0,                   // 总价格    
    shopIndex: 0,                     // 当前操作的商品购物车索引   不选规格的  
    desk_num: '',                     // 桌号
    businessid: 1,                    // 商家id   
  },

  onLoad: function (options) {
    let { business_offline_id, no, business_name} = options;
    app.setTitle(business_name);
    //菜品分类列表
    app.post('ordering/dishescategory', {
      paging: 1,
      businessid: business_offline_id,
    }, (res) => {
      let data = res.data;
      this.setData({
        itemList: data,
        ordering_categoryid: data[0].ordering_category_id,
        desk_num: no,
        businessid: business_offline_id
      });
      this.getGoodsList()
    })
  },

  // 菜品分类点击切换
  selectMenu: function (e) {
    let { id } = e.currentTarget.dataset;
    this.setData({
      ordering_categoryid: id,
      goods_list:{}
    })
    this.getGoodsList();
  },

  // 获取商品列表
  getGoodsList: function () {
    let { goods_list, businessid, ordering_categoryid } = this.data;
    // 获取右边菜品列表
    app.post('ordering/userindex', {
      ordering_categoryid,
      businessid: businessid           //商家id,自己传的1
    }, (res) => {
      if (res.code == 200) {
        for(let goods of res.data) {
          goods_list[goods.ordering_dishes_id] = {
            ordering_dishes_id: goods.ordering_dishes_id,
            ordering_categoryid: goods.ordering_categoryid,
            dishesname: goods.dishesname,
            dishespicture: goods.dishespicture,
            dishesprice: goods.dishesprice,
            dishesdesc: goods.dishesdesc,
            cname: goods.cname,
            sales: goods.sales,
            is_specifications: goods.is_specifications
          }

          if (!goods.is_specifications) {
            goods_list[goods.ordering_dishes_id].flag = 0;
          }
        }

        this.setData({
          goods_list
        })
      }
    })
  },

  // 展示规格
  chooseDesc: function (e) {
    let { ordering_dishes_id, img} = e.currentTarget.dataset;

    // ordering_dishes_id = 1;    // 模拟数据 不需要的之后直接删除

    // 初始化数据
    let { format_list, check_list } = this.data;
    format_list = {
      specifications:{},
      specifications_len:0,
      addishes_len: 0,
      addishes: {},
      flavors_len: 0,
      flavors: {}
    }

    this.initCheckList();
    
    // end

    app.post('ordering/dishesparameter',{
      dishes_id: ordering_dishes_id,
    }, (res) => {
      if(res.code == 200) {
        for (let key in res.data){
          let data = res.data[key];
          if (key == 'flavors') {               // 口味
            format_list.flavors = data;
          } else if (key == 'specifications') { // 规格
            for (let specifications of data) {
              format_list.specifications[specifications.specifications_id] = specifications
              format_list.specifications_len += 1;
            }
          } else if (key == 'addishes') {       // 加菜
            for (let addishes of data) {
              format_list.addishes[addishes.ordering_adddishe_id] = addishes;
              format_list.addishes_len += 1;
            }
          }     
        }
        
        format_list.flavors_len = format_list.flavors.length
        this.setData({
          showDesc: true,
          format_list,
          ordering_dishes_id,
          format_img:img
        });
      } 
    });
  },

  // 选择规格
  checkFormat: function(e) {
    let { type } = e.currentTarget.dataset;
    let { check_list, format_list } = this.data;
    
    if (type == "specifications") {       // 规格
      let { specifications_id, specifications_name } = e.currentTarget.dataset;
      check_list.specifications = [specifications_id, specifications_name];
      check_list.price = +format_list.specifications[specifications_id].gprice;
      check_list.addishes = {};
    } else if (type == 'addishes') {      // 加菜
      let { ordering_adddishe_id, name } = e.currentTarget.dataset;
      if (check_list.addishes[ordering_adddishe_id]) {
        delete check_list.addishes[ordering_adddishe_id];
        check_list.price -= +format_list.addishes[ordering_adddishe_id].price;
      } else {
        check_list.addishes[ordering_adddishe_id] = [ordering_adddishe_id, name];
        check_list.price += +format_list.addishes[ordering_adddishe_id].price;
      }
    } else if (type == 'flavors') {       // 口味
      let { flavortype, flavorname, ordering_flavor_id } = e.currentTarget.dataset;
      check_list.flavors[flavortype] = [ordering_flavor_id,flavorname];
    }

    this.setData({
      check_list
    });
  },

  // 关闭弹窗
  close: function () {
    this.setData({
      showDesc: false,
    });
  },            

  // 格式化加入购物车数据
  formatShopcart: function(id) {
    let { check_list, ordering_categoryid, goods_list, shopcart } = this.data;
    let goods = goods_list[id];

    let json = {};
    let shopcartGoodsId = 0;
    // 要选择规格的
    if (goods.is_specifications) {
      if (check_list.specifications) {  // 规格
        json.specificationsid = check_list.specifications[0];
        json.specification_name = check_list.specifications[1];
      }
      if (check_list.addishes) {        // 加菜
        json.adddish_id = [];
        json.adddish_name = [];
        for (let key in check_list.addishes) {
          let addishes = check_list.addishes[key];
          json.adddish_id.push(addishes[0]);
          json.adddish_name.push(addishes[1]);
        }
      }
      if (check_list.flavors) {         // 口味
        json.flavor_name = [];
        json.flavor_id = [];
        for (let key in check_list.flavors) {
          let flavors = check_list.flavors[key];
          json.flavor_name.push(flavors[1]);
          json.flavor_id.push(flavors[0]);
        }
      }

      shopcartGoodsId = this.formatId(ordering_categoryid, id, json.specificationsid, Object.keys(check_list.addishes), json.flavor_id);
    } else {
      shopcartGoodsId = this.formatId(ordering_categoryid, id);
    }

    if (shopcart[shopcartGoodsId]) { // 商品已经加入购物车
      shopcart[shopcartGoodsId].dishes_num += 1;
    } else {
      json.dishes_id = goods.ordering_dishes_id
      json.dishes_name = goods.dishesname;
      json.dishes_picture = goods.dishespicture;
      json.dishes_price = goods.dishesprice;
      json.in_total = check_list.price || goods.dishesprice;
      json.dishes_num = 1;
      json.category_id = goods.ordering_categoryid;
      json.category_name = goods.cname;
      json.remakers = '';
      shopcart[shopcartGoodsId] = json;
    }
    
    return shopcart;
  },

  /**
   * 处理购物车id
   * @category_id   分类id
   * @id            商品id
   * @desc_id       规格id
   * jiacai_arr     加菜id  从大到小排序
   */
  formatId: function (category_id, id, desc_id, jiacai_arr, kouwei_arr) {
    if (jiacai_arr) {
      jiacai_arr = jiacai_arr.sort((a, b) => {
        return a - b;
      });
    } else if (kouwei_arr) {
      kouwei_arr = kouwei_arr.sort((a, b) => {
        return a - b;
      })
    }

    if (desc_id) {
      return `${id}-${desc_id}-${jiacai_arr}-${kouwei_arr}`
    } else {
      return `${id}`
    }
  },

  // 加入购物车
  joinShopcart: function (e) {
    let { check_list, ordering_dishes_id } = this.data;
    let { type, dishes_id } = e.currentTarget.dataset;

    if (!check_list.specifications.length && type == 'format') return app.alert('请选择规格！', 'none');

    let shopcart = this.formatShopcart(type == 'format' ? ordering_dishes_id : dishes_id);
    this.calcTotalPrice();
    this.initCheckList();
    this.setData({
      showDesc: false,
      shopcart,
      shopcart_len: Object.keys(shopcart).length
    });
  },

  initCheckList: function() {
    let { check_list } = this.data;
    check_list = {
      price: 0,
      specifications: [],
      flavors: {},
      addishes: {}
    }

    this.setData({
      check_list
    })
  },

  checkNum: function(e) {
    let { dishes_id, num } = e.currentTarget.dataset;
    let { ordering_categoryid, shopcart } = this.data;
    let shopcartId = this.formatId(ordering_categoryid, dishes_id);
    shopcart[shopcartId].dishes_num += +num;
    if (shopcart[shopcartId].dishes_num < 1) {
      delete shopcart[shopcartId];
    } 
    this.calcTotalPrice();
    this.setData({
      shopcart
    })
  },

  // 计算购物车总价格
  calcTotalPrice: function() {
    let { shopcart, total_price } = this.data;
    total_price = 0;
    for(let key in shopcart) {
      let goods = shopcart[key];
      total_price += +goods.in_total * goods.dishes_num;
    }

    this.setData({ 
      total_price,
      shopcart_len: Object.keys(shopcart).length 
    });
  },

  clearCart() {
    let { shopcart, total_price } = this.data;
    this.setData({
      shopcart: {},
      total_price: 0,
      shopcart_len: 0,
    })
  },

  // 弹出点餐清单
  chosenDishes: function () {
    this.setData({
      showAddCart: !this.data.showAddCart
    });
  },


  // 底部结算加减
  CheckTotalNum: function(e) {
    let {index, num} = e.currentTarget.dataset;
    let {shopcart} = this.data;
    shopcart[index].dishes_num += +num
    
    if (shopcart[index].dishes_num < 1) {
      delete shopcart[index]
    } 

    this.calcTotalPrice();
    this.setData({
      shopcart
    })
  },

  // 情况购物车
  clearShopcart: function() {
    let { shopcart } = this.data;
    shopcart = {};
    this.calcTotalPrice();
    this.setData({
      shopcart
    })
  },

  // 去结算
  goBuy: function () {
    let { shopcart, total_price, businessid, desk_num} = this.data;
    app.setStorageSync({ shopcart, total_price});
    app.openPage(`diancan/submitOrder/submitOrder?businessid=${businessid}&desk_id=${desk_num}`);
  },
})
