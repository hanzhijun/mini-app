
const app = getApp();
let city = '';
setTimeout(function () {
    city = app.data.city;
}, 2000);
setTimeout(function () {
    city = app.data.city;
}, 8000);
/**
 * @param {function} fun 接口
 * @param {object} options 接口参数
 * @returns {Promise} Promise对象
 */
function fetch(options) {
  options = options || {};
  return new Promise((resolve, reject) => {
    options.success = resolve;
    options.fail = reject;
    ajax(options);
  });
}

let json = {
  sheng: [0,''],
  shi: [0,''],
  qu: [0,'']
};

function getCity(a, b) {
  let sheng = [];
  let shi = [];
  let qu = [];

  if (a || b) { // 获取省份
    let data = {};
    if (a && b) {
      try {
        data = city[a].child[b].child
      } catch (e) {
        data = city[a].child
      }
    } else {
      data = city[a].child
    }
    
    for (let key in data) {
      if (a && b) {
        qu.push({ code: data[key].id, fullName: data[key].name });
      } else {
        if (city[a].pro) {
          shi = [];
          break;
        }
        shi.push({ code: data[key].id, fullName: data[key].name });
      }
    }

  } else {
    for (let key in city) {
      let ksheng = city[key];
      sheng.push({ code: ksheng.id, fullName: ksheng.name });
    }
  }
  
  return { province: sheng, city: shi,district: qu};
}


function ajax(json) {
  json.success && json.success(getCity(json.a,json.b));
}



const conf = {
  addDot: function (arr) {
    if (arr instanceof Array) {
      const tmp = arr.slice();
      tmp.map(val => {
        if (val.fullName.length > 4) {
          val.fullNameDot = val.fullName.slice(0, 4) + '...';
        } else {
          val.fullNameDot = val.fullName;
        }
      });
      return tmp;
    }
  },

  bindTap: function(e, fn) {
    let { type } = e.currentTarget.dataset;
    

    this.setData({
      'areaPicker.show': false
    });    
  },

  /**
	 * 滑动事件
	 * @param {object} e 事件对象
	 */
  bindChange: function (e) {
    const currentValue = e.detail.value;
    const { value, provinceData } = this.data.areaPicker;
    const self = _getCurrentPage();
    const hideDistrict = self.config.hideDistrict;
    const provinceCondition = hideDistrict ? value[0] !== currentValue[0] && value[1] === currentValue[1] : value[0] !== currentValue[0] && value[1] === currentValue[1] && value[2] === currentValue[2];
    const cityCondition = hideDistrict ? value[0] === currentValue[0] && value[1] !== currentValue[1] : value[0] === currentValue[0] && value[1] !== currentValue[1] && value[2] === currentValue[2];
    const districtCondition = hideDistrict ? false : value[0] === currentValue[0] && value[1] === currentValue[1] && value[2] !== currentValue[2];
    if (provinceCondition) {
      // 滑动省份
      fetch({
        a: provinceData[currentValue[0]].code,
      }).then((data) => {
        let {city} = data;
        if(!city.length) {
          city = [{
            code: provinceData[currentValue[0]].code,
            fullName: provinceData[currentValue[0]].fullName
          }]
        }
        const cityData = city;
        if (cityData && cityData.length) {
          const dataWithDot = conf.addDot(city);
          this.setData({
            'areaPicker.cityData': dataWithDot
          });

          return (
            fetch({
              b: dataWithDot[0].code,
              a: provinceData[currentValue[0]].code
            })
          );
        } else {
          this.setData({
            'areaPicker.cityData': [],
            'areaPicker.districtData': [],
            'areaPicker.address': provinceData[currentValue[0]].fullName,
            'areaPicker.selected': [provinceData[currentValue[0]]],
          });
        }
      }).then((data) => {
        let { district } = data;
        const districtData = district;
        const { cityData } = this.data.areaPicker;
        if (districtData && districtData.length > 0) {
          const dataWithDot = conf.addDot(districtData);
          this.setData({
            'areaPicker.districtData': dataWithDot,
            'areaPicker.value': [ currentValue[0], 0, 0 ],
            'areaPicker.address': provinceData[currentValue[0]].fullName + ' - ' + cityData[0].fullName + (hideDistrict ? '' : ' - ' + dataWithDot[0].fullName),
            'areaPicker.selected': hideDistrict ? [provinceData[currentValue[0]], cityData[0]] : [provinceData[currentValue[0]], cityData[0], dataWithDot[0]]
          });
        } else {
          this.setData({
            'areaPicker.districtData': [],
            'areaPicker.value': [ currentValue[0], currentValue[1], 0 ],
            'areaPicker.address': provinceData[currentValue[0]].fullName + ' - ' + cityData[0].fullName,
            'areaPicker.selected': [provinceData[currentValue[0]], cityData[0]]
          });
        }
      }).catch((e) => {
        console.error(e);
      });
    } else if (cityCondition) {
      const { provinceData, cityData } = this.data.areaPicker;
      // 滑动城市
      fetch({
        a: provinceData[currentValue[0]].code,
        b: cityData[currentValue[1]].code,
      }).then((data) => {
        let { district } = data;
        if (!district.length) return;
        const districtData = district;
        if (districtData && districtData.length > 0) {
          const dataWithDot = conf.addDot(districtData);
          this.setData({
            'areaPicker.districtData': dataWithDot,
            'areaPicker.value': [ currentValue[0], currentValue[1], 0 ],
            'areaPicker.address': provinceData[currentValue[0]].fullName + ' - ' + cityData[currentValue[1]].fullName + (hideDistrict ? '' : ' - ' + dataWithDot[0].fullName),
            'areaPicker.selected': hideDistrict ? [provinceData[currentValue[0]], cityData[currentValue[1]]] : [provinceData[currentValue[0]], cityData[currentValue[1]], dataWithDot[0]]
          });
        } else {
          this.setData({
            'areaPicker.districtData': [],
            'areaPicker.value': [ currentValue[0], currentValue[1], 0 ],
            'areaPicker.address': provinceData[currentValue[0]].fullName + ' - ' + cityData[currentValue[1]].fullName,
            'areaPicker.selected': [provinceData[currentValue[0]], cityData[currentValue[1]]]
          });
        }
      }).catch((e) => {
        console.error(e);
      });
    } else if (districtCondition) {
      const { cityData, districtData } = this.data.areaPicker;
      // 滑动地区
      this.setData({
        'areaPicker.value': currentValue,
        'areaPicker.address': provinceData[currentValue[0]].fullName + ' - ' + cityData[currentValue[1]].fullName + (hideDistrict ? '' : ' - ' + districtData[currentValue[2]].fullName),
        'areaPicker.selected': hideDistrict ? [provinceData[currentValue[0]], cityData[currentValue[1]]] : [provinceData[currentValue[0]], cityData[currentValue[1]], districtData[currentValue[2]]]
      });
    }
  }
};

function _getCurrentPage() {
  const pages = getCurrentPages();
  const last = pages.length - 1;
  return pages[ last ];
}

export const getSelectedAreaData = () => {
  const self = _getCurrentPage();
  return self.data.areaPicker.selected;
};

export default (config = {}) => {
  const self = _getCurrentPage();
  self.setData({
    'areaPicker.hideDistrict': !config.hideDistrict
  });
  self.config = config;
  self.bindChange = conf.bindChange.bind(self);
  self.bindTap = conf.bindTap.bind(self);

  fetch().then((data) => {
    let { province } = data;
    const firstProvince = province[0];
    const dataWithDot = conf.addDot(province);
   
    /**
		 * 默认选择获取的省份第一个省份数据
		 */
    self.setData({
      'areaPicker.provinceData': dataWithDot,
      'areaPicker.selectedProvince.index': 0,
      'areaPicker.selectedProvince.code': firstProvince.code,
      'areaPicker.selectedProvince.fullName': firstProvince.fullName,
    });
    return (
      fetch({
        a: firstProvince.code,
      })
    );
  }).then((data) => {
    let {city} = data;
    if(!city.length) {
      city = [{
        code: self.data.areaPicker.selectedProvince.code,
        fullName: self.data.areaPicker.selectedProvince.fullName
      }]
    }
    const firstCity = city[0];
    const dataWithDot = conf.addDot(city);
    self.setData({
      'areaPicker.cityData': dataWithDot,
      'areaPicker.selectedCity.index': 0,
      'areaPicker.selectedCity.code': firstCity.code,
      'areaPicker.selectedCity.fullName': firstCity.fullName,
    });
    /**
		 * 省市二级则不请求区域
		 */
    if (!config.hideDistrict) {
      return (
        fetch({
          a: self.data.areaPicker.selectedProvince.code,
          b: self.data.areaPicker.selectedCity.code
        })
      );
    } else {
      const { provinceData, cityData } = self.data.areaPicker;
      self.setData({
        'areaPicker.value': [0, 0],
        'areaPicker.address': provinceData[0].fullName + ' - ' + cityData[0].fullName,
        'areaPicker.selected': [provinceData[0], cityData[0]]
      });
    }
  }).then((data) => {
    let { district } = data;
    if (!district.length) return;
    const firstDistrict = district[0];
    const dataWithDot = conf.addDot(district);
    const { provinceData, cityData } = self.data.areaPicker;
    self.setData({
      'areaPicker.value': [0, 0, 0],
      'areaPicker.districtData': dataWithDot,
      'areaPicker.selectedDistrict.index': 0,
      'areaPicker.selectedDistrict.code': firstDistrict.code,
      'areaPicker.selectedDistrict.fullName': firstDistrict.fullName,
      'areaPicker.address': provinceData[0].fullName + ' - ' + cityData[0].fullName + ' - ' + firstDistrict.fullName,
      'areaPicker.selected': [provinceData[0], cityData[0], firstDistrict]
    });
  }).catch((e) => {
    console.error(e);
  });
};
