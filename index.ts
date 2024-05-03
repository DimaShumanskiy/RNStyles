import { Dimensions, PixelRatio ,ImageStyle ,TextStyle, ViewStyle, StyleSheet} from 'react-native';

interface ConfigDTO {
  designWidth: number;
  designHeight: number;
  minimalFactor: number;
}

type StyleSheetDTO = Record<string, any>;

type NamedStyles<T> = {[P in keyof T]: ViewStyle | TextStyle | ImageStyle};


const CONFIG: ConfigDTO = {
  designWidth: 375,
  designHeight: 812,
  minimalFactor: 1
};

class RNStyles {
  private designWidth: number | null = null;
  private designHeight: number | null = null;
  private minimalFactor: number | null = null;

  private factorWidth: number | null = null;
  private factorHeight: number | null = null;
  private factorAverage: number | null = null;

  pluginInited = false;

  constructor() {
    this.init();
  }

  init(config?: ConfigDTO) {
    const { height, width } = Dimensions.get('window');

    this.designWidth = config?.designWidth || CONFIG.designWidth;
    this.designHeight = config?.designHeight || CONFIG.designHeight;
    this.minimalFactor = config?.minimalFactor || CONFIG.minimalFactor;

    const factorWidth = width / this.designWidth;
    this.factorWidth =
      factorWidth < this.minimalFactor
        ? (factorWidth + this.minimalFactor) / 2
        : factorWidth;

    const factorHeight = height / this.designHeight;
    this.factorHeight =
      factorHeight < this.minimalFactor
        ? (factorHeight + this.minimalFactor) / 2
        : factorHeight;

    this.factorAverage = (this.factorWidth + this.factorHeight) / 2;
    this.pluginInited = true;
  }

  w(n: number): number {
    return PixelRatio.roundToNearestPixel((this.factorWidth as number) * n);
  }

  h(n: number): number {
    return PixelRatio.roundToNearestPixel((this.factorHeight as number) * n);
  }

  wh(n: number): number {
    return PixelRatio.roundToNearestPixel((this.factorAverage as number) * n);
  }

  __modify(obj: StyleSheetDTO) {
    const getProp = (o: any, withFactorAverage = false) => {
      for (let prop in o) {
        if (typeof o[prop] === 'object') {
          getProp(o[prop], !!o[prop].useAverageFactor);
        } else {
          if (typeof o[prop] !== 'string') {
            switch (prop) {
              case 'useAverageFactor':
                delete o[prop];
                break;
              case 'fontSize':
              case 'lineHeight':
              case 'height':
              case 'paddingVertical':
              case 'paddingTop':
              case 'paddingBottom':
              case 'marginVertical':
              case 'marginTop':
              case 'marginBottom':
              case 'borderBottomLeftRadius':
              case 'borderBottomRighRadius':
              case 'borderTopLeftRadius':
              case 'borderTopRightRadius':
              case 'top':
              case 'bottom':
                if (!withFactorAverage) {
                  o[prop] = this.h(o[prop]);
                } else {
                  o[prop] = this.wh(o[prop]);
                }
                break;
              case 'paddingHorizontal':
              case 'width':
              case 'paddingLeft':
              case 'paddingRight':
              case 'marginHorizontal':
              case 'marginLeft':
              case 'marginRight':
              case 'right':
              case 'left':
              case 'minWidth':
                if (!withFactorAverage) {
                  o[prop] = this.w(o[prop]);
                } else {
                  o[prop] = this.wh(o[prop]);
                }
                break;
              case 'square':
                o.width = this.wh(o[prop]);
                o.height = this.wh(o[prop]);
                delete o[prop];
                break;
              case 'borderRadius':
                o[prop] = this.wh(o[prop]);
            }
          } else {
            if (!isNaN(o[prop])) {
              if (prop !== 'fontWeight') {
                o[prop] = Number(o[prop]);
              }
            }
          }
        }
      }
    };

    getProp(obj);

    return obj;
  }

  create<T extends NamedStyles<T> | NamedStyles<any>>( styles: T | NamedStyles<T>): T {
    return StyleSheet.create(this.__modify(styles)) as T;
  }
}

export default new RNStyles();
