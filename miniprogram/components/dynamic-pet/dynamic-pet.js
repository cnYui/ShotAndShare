// 动态宠物组件逻辑
Component({
  properties: {
    // 宠物基本信息
    petData: {
      type: Object,
      value: {},
      observer: 'onPetDataChange'
    },
    // 宠物大小
    size: {
      type: String,
      value: 'normal' // small, normal, large
    },
    // 是否显示等级
    showLevel: {
      type: Boolean,
      value: true
    },
    // 动画速度
    animationSpeed: {
      type: Number,
      value: 1
    }
  },

  data: {
    // 宠物外观
    bodyImage: '',
    cheeksImage: '',
    eyesImage: '',
    mouthImage: '',
    tailImage: '',
    
    // 样式类名
    petClass: '',
    bodyClass: '',
    cheeksClass: '',
    eyesClass: '',
    mouthClass: '',
    tailClass: '',
    
    // 样式
    containerStyle: '',
    bodyStyle: '',
    cheeksStyle: '',
    eyesStyle: '',
    mouthStyle: '',
    tailStyle: '',
    
    // 互动效果
    showFood: false,
    showHeart: false,
    showPoop: false,
    showStink: false,
    showLaser: false,
    
    foodImage: '',
    heartImage: '',
    poopImage: '',
    stinkImage: '',
    laserImage: '',
    
    foodClass: '',
    heartClass: '',
    poopClass: '',
    stinkClass: '',
    laserClass: '',
    
    foodStyle: '',
    heartStyle: '',
    poopStyle: '',
    stinkStyle: '',
    laserStyle: '',
    
    // 宠物状态
    level: 1,
    stage: 'baby', // egg, baby, child, adult, elder
    mood: 'happy', // happy, sad, sick, excited, sleeping
    action: 'idle', // idle, walking, eating, sleeping, playing
    
    // 行走状态
    walkPosition: 0,
    walkDirection: 'right',
    isAutoWalking: false,
    
    // 自动行为控制
    autoWalkTimer: null,
    layDownTimer: null,
    behaviorTimer: null,
    
    // 动画控制
    animationTimer: null,
    blinkTimer: null,
    actionTimer: null,
    layDownTimer: null,
    walkTimer: null,
    
    // egg破碎动画
    isEggCracking: false,
    eggCrackFrame: 1,
    eggCrackTimer: null
  },

  lifetimes: {
    attached() {
      this.initPet();
      this.startAnimations();
      this.startAutoWalk();
    },
    
    detached() {
      this.stopAnimations();
      this.stopAutoWalk();
    }
  },

  methods: {
    // 初始化宠物
    initPet() {
      const petData = this.data.petData;
      if (petData && Object.keys(petData).length > 0) {
        this.updatePetAppearance(petData);
      } else {
        // 默认宠物状态
        this.setDefaultPet();
      }
    },
    
    // 设置默认宠物
    setDefaultPet() {
      this.setData({
        level: 1,
        stage: 'baby', // 默认从baby阶段开始，避免child图片问题
        mood: 'happy',
        action: 'idle'
      });
      this.updateImages();
      this.updateStyles();
    },
    
    // 宠物数据变化监听
    onPetDataChange(newData, oldData) {
      if (newData && Object.keys(newData).length > 0) {
        this.updatePetAppearance(newData);
      }
    },
    
    // 更新宠物外观
    updatePetAppearance(petData) {
      const level = petData.level || 1;
      const health = petData.health || 100;
      const vitality = petData.vitality || 100;
      const intimacy = petData.intimacy || 50;
      
      // 根据等级确定生命阶段
      let stage = 'egg';
      if (level >= 15) stage = 'elder';        // 老年猫 (15+级)
      else if (level >= 10) stage = 'adult';   // 成年猫 (10-15级)
      else if (level >= 4) stage = 'child';    // 小猫 (4-10级)
      else if (level >= 1) stage = 'baby';     // 幼猫 (1-3级)
      else stage = 'egg';                      // 蛋 (一开始)
      
      // 根据状态确定情绪
      let mood = 'happy';
      if (health < 30) mood = 'sick';
      else if (vitality < 20) mood = 'sad';
      else if (intimacy > 80) mood = 'excited';
      else if (vitality < 40) mood = 'sleeping';
      
      const oldStage = this.data.stage;
      
      this.setData({
        level,
        stage,
        mood,
        action: 'idle'
      });
      
      this.updateImages();
      this.updateStyles();
      
      // 如果从蛋状态变为其他状态，启动自动走动
      if (oldStage === 'egg' && stage !== 'egg') {
        setTimeout(() => {
          this.startAutoWalk();
        }, 1000);
      }
    },
    
    // 更新图片资源
    updateImages() {
      const { stage, mood, action } = this.data;
      const basePath = 'cloud://cloud1-6g4qsd2kcddd1be0.636c-cloud1-6g4qsd2kcddd1be0-1370408816/pet_images';
      
      // 身体图片 - 优先处理特殊动作，避免默认图片覆盖
      let bodyImage;
      if (stage === 'egg') {
        bodyImage = `${basePath}/egg1_Normal@2x.png`;
      } else if (action === 'walking') {
        // 使用对应阶段的walk图片
        if (stage === 'baby') {
          bodyImage = `${basePath}/babyWalk1_Normal@2x.png`;
        } else if (stage === 'child') {
          bodyImage = `${basePath}/childWalk1_Normal@2x.png`;
        } else if (stage === 'adult') {
          bodyImage = `${basePath}/adultWalk1_Normal@2x.png`;
        } else if (stage === 'elder') {
          bodyImage = `${basePath}/elderWalk1_Normal@2x.png`;
        }
      } else if (action === 'laydown' || action === 'sleeping') {
        // 只有adult阶段支持laydown动作
        if (stage === 'adult') {
          bodyImage = `${basePath}/layDownAdult1_Normal@2x.png`;
        } else {
          // 其他阶段在laydown或sleeping状态下使用默认身体图片
          if (stage === 'baby') {
            bodyImage = `${basePath}/babyBody_Normal@2x.png`;
          } else if (stage === 'child') {
            bodyImage = `${basePath}/childBody_Normal@2x.png`;
          } else if (stage === 'elder') {
            bodyImage = `${basePath}/elderBody_Normal@2x.png`;
          }
        }
      } else {
        // 处理各阶段的默认身体图片
        if (stage === 'baby') {
          bodyImage = `${basePath}/babyBody_Normal@2x.png`;
        } else if (stage === 'child') {
          bodyImage = `${basePath}/childBody_Normal@2x.png`;
        } else if (stage === 'adult') {
          bodyImage = `${basePath}/bodyNeutral_Normal@2x.png`;
        } else if (stage === 'elder') {
          bodyImage = `${basePath}/elderBody_Normal@2x.png`;
        }
      }
      
      // 脸颊图片 - 增加更多表情状态
      let cheeksImage = '';
      if (stage !== 'egg') {
        if (mood === 'sick') {
          if (stage === 'baby') {
            cheeksImage = `${basePath}/babyCheeksUnhealthy_Normal@2x.png`;
          } else if (stage === 'child') {
            cheeksImage = `${basePath}/childCheeksUnhealthy_Normal@2x.png`;
          } else if (stage === 'adult') {
            cheeksImage = `${basePath}/cheeksUnhealthy_Normal@2x.png`;
          } else if (stage === 'elder') {
            cheeksImage = `${basePath}/elderCheeksUnhealthy_Normal@2x.png`;
          }
        } else if (mood === 'excited' || mood === 'happy') {
          // 开心时使用粉色脸颊
          if (stage === 'baby') {
            cheeksImage = `${basePath}/babyCheeksPink_Normal@2x.png`;
          } else if (stage === 'child') {
            cheeksImage = `${basePath}/childCheeksPink_Normal@2x.png`;
          } else if (stage === 'adult') {
            cheeksImage = `${basePath}/cheeksFlush_Normal@2x.png`; // 使用开心表情
          } else if (stage === 'elder') {
            cheeksImage = `${basePath}/elderCheeksPink_Normal@2x.png`;
          }
        } else if (mood === 'overfed') {
          // 喂食过多时的表情
          if (stage === 'adult') {
            cheeksImage = `${basePath}/cheeksOvereat_Normal@2x.png`;
          } else if (stage === 'child') {
            cheeksImage = `${basePath}/childCheeksPink_Normal@2x.png`;
          } else if (stage === 'baby') {
            cheeksImage = `${basePath}/babyCheeksPink_Normal@2x.png`;
          } else if (stage === 'elder') {
            cheeksImage = `${basePath}/elderCheeksPink_Normal@2x.png`;
          }
        } else if (action === 'laydown' && stage === 'adult') {
          // laydown动作时使用相应的表情
          cheeksImage = `${basePath}/cheeksNeutral_Normal@2x.png`;
        } else {
          // 默认表情
          if (stage === 'baby') {
            cheeksImage = `${basePath}/babyCheeks_Normal@2x.png`;
          } else if (stage === 'child') {
            cheeksImage = `${basePath}/childCheeksNeutral_Normal@2x.png`;
          } else if (stage === 'adult') {
            cheeksImage = `${basePath}/cheeksNeutral_Normal@2x.png`;
          } else if (stage === 'elder') {
            cheeksImage = `${basePath}/elderCheeksNeutral_Normal@2x.png`;
          }
        }
      }
      
      // 眼睛图片 - 支持眨眼动画
      let eyesImage = '';
      if (stage !== 'egg') {
        if (mood === 'sleeping' || action === 'laydown') {
          // 睡觉或趴下时闭眼
          if (stage === 'baby') {
            eyesImage = `${basePath}/babyEyesBlink_Normal@2x.png`;
          } else if (stage === 'child') {
            eyesImage = `${basePath}/childEyesBlink_Normal@2x.png`;
          } else if (stage === 'adult') {
            eyesImage = `${basePath}/childEyesBlink_Normal@2x.png`; // 使用child的眼睛图片
          } else if (stage === 'elder') {
            eyesImage = `${basePath}/elderEyesClosed_Normal@2x.png`;
          }
        } else if (mood === 'sick') {
          // 生病时的眼睛
          if (stage === 'baby') {
            eyesImage = `${basePath}/babyEyes_Normal@2x.png`;
          } else if (stage === 'child') {
            eyesImage = `${basePath}/childEyesDead_Normal@2x.png`;
          } else if (stage === 'adult') {
            eyesImage = `${basePath}/childEyesDead_Normal@2x.png`; // 使用child的眼睛图片
          } else if (stage === 'elder') {
            eyesImage = `${basePath}/elderEyesOpen_Normal@2x.png`;
          }
        } else {
          // 正常睁眼状态
          if (stage === 'baby') {
            eyesImage = `${basePath}/babyEyes_Normal@2x.png`;
          } else if (stage === 'child') {
            eyesImage = `${basePath}/childEyes_Normal@2x.png`;
          } else if (stage === 'adult') {
            eyesImage = `${basePath}/childEyes_Normal@2x.png`; // 使用child的眼睛图片
          } else if (stage === 'elder') {
            eyesImage = `${basePath}/elderEyesOpen_Normal@2x.png`;
          }
        }
      }
      
      // 嘴巴图片
      let mouthImage = '';
      if (stage !== 'egg') {
        if (action === 'eating') {
          if (stage === 'baby') {
            mouthImage = `${basePath}/babyMouthOpen_Normal@2x.png`;
          } else if (stage === 'child') {
            mouthImage = `${basePath}/childMouthEating1_Normal@2x.png`;
          } else if (stage === 'adult') {
            mouthImage = `${basePath}/mouthEating1_Normal@2x.png`;
          } else if (stage === 'elder') {
            mouthImage = `${basePath}/elderMouthEating1_Normal@2x.png`;
          }
        } else if (mood === 'happy' || mood === 'excited') {
          if (stage === 'baby') {
            mouthImage = `${basePath}/babyMouthHappy_Normal@2x.png`;
          } else if (stage === 'child') {
            mouthImage = `${basePath}/childMouthHappy_Normal@2x.png`;
          } else if (stage === 'adult') {
            mouthImage = `${basePath}/mouthSmile_Normal@2x.png`;
          } else if (stage === 'elder') {
            mouthImage = `${basePath}/elderMouthHappy_Normal@2x.png`;
          }
        } else if (mood === 'sad') {
          if (stage === 'baby') {
            mouthImage = `${basePath}/babyMouthUnhappy_Normal@2x.png`;
          } else if (stage === 'child') {
            mouthImage = `${basePath}/childMouthUnhappy_Normal@2x.png`;
          } else if (stage === 'adult') {
            mouthImage = `${basePath}/mouthUnhappy_Normal@2x.png`;
          } else if (stage === 'elder') {
            mouthImage = `${basePath}/elderMouthUnhappy_Normal@2x.png`;
          }
        } else {
          if (stage === 'baby') {
            mouthImage = `${basePath}/babyMouthNeutral_Normal@2x.png`;
          } else if (stage === 'child') {
            mouthImage = `${basePath}/childMouthNeutral_Normal@2x.png`;
          } else if (stage === 'adult') {
            mouthImage = `${basePath}/mouthNeutral_Normal@2x.png`;
          } else if (stage === 'elder') {
            mouthImage = `${basePath}/elderMouthNeutral_Normal@2x.png`;
          }
        }
      }
      
      // 尾巴图片 - 支持laydown状态的专门图片
      let tailImage = '';
      if (stage !== 'egg') {
        if (action === 'laydown' || action === 'sleeping') {
          // laydown时使用专门的TailDown图片
          if (stage === 'baby') {
            tailImage = `${basePath}/babyTailDown_Normal@2x.png`;
          } else if (stage === 'child') {
            tailImage = `${basePath}/childTailDown_Normal@2x.png`;
          } else if (stage === 'adult') {
            tailImage = `${basePath}/tailNeutral_Normal@2x.png`; // adult没有tailDown，使用neutral
          } else if (stage === 'elder') {
            tailImage = `${basePath}/elderTailDown_Normal@2x.png`;
          }
        } else if (mood === 'excited' || mood === 'happy') {
          tailImage = `${basePath}/wag1_Normal@2x.png`;
        } else if (mood === 'sad') {
          if (stage === 'baby') {
            tailImage = `${basePath}/babyTailDown_Normal@2x.png`;
          } else if (stage === 'child') {
            tailImage = `${basePath}/childTailDown_Normal@2x.png`;
          } else if (stage === 'adult') {
            tailImage = `${basePath}/tailNeutral_Normal@2x.png`; // adult没有tailDown，使用neutral
          } else if (stage === 'elder') {
            tailImage = `${basePath}/elderTailDown_Normal@2x.png`;
          }
        } else {
          // 默认状态的尾巴
          if (stage === 'baby') {
            tailImage = `${basePath}/babyTail1_Normal@2x.png`;
          } else if (stage === 'child') {
            tailImage = `${basePath}/childTail1_Normal@2x.png`;
          } else if (stage === 'adult') {
            tailImage = `${basePath}/tailNeutral_Normal@2x.png`;
          } else if (stage === 'elder') {
            tailImage = `${basePath}/elderTail1_Normal@2x.png`;
          }
        }
      }
      
      // 互动效果图片
      const foodImage = stage === 'baby' ? `${basePath}/foodBaby_Normal@2x.png` : `${basePath}/food_Normal@2x.png`;
      const heartImage = `${basePath}/heart_Normal@2x.png`;
      
      let poopImage = '';
      if (stage === 'baby') {
        poopImage = `${basePath}/poopBaby_Normal@2x.png`;
      } else if (stage === 'child') {
        poopImage = `${basePath}/poopChild_Normal@2x.png`;
      } else if (stage === 'adult') {
        poopImage = `${basePath}/poopAdult_Normal@2x.png`;
      } else if (stage === 'elder') {
        poopImage = `${basePath}/poopAdult_Normal@2x.png`; // 老年猫使用成年猫的便便图片
      }
      
      const stinkImage = `${basePath}/poopStinkLines1_Normal@2x.png`;
      const laserImage = `${basePath}/laserpointer_Normal@2x.png`;
      
      this.setData({
        bodyImage,
        cheeksImage,
        eyesImage,
        mouthImage,
        tailImage,
        foodImage,
        heartImage,
        poopImage,
        stinkImage,
        laserImage
      });
    },
    
    // 更新样式
    updateStyles() {
      const { stage, mood, action, size, walkPosition, walkDirection } = this.data;
      
      // 容器样式类
      let petClass = `stage-${stage} mood-${mood}`;
      if (action !== 'idle') {
        petClass += ` ${action}`;
      }
      
      // 添加尺寸类
      let sizeClass = '';
      if (size === 'small') {
        sizeClass = 'size-small';
      } else if (size === 'large') {
        sizeClass = 'size-large';
      }
      
      if (sizeClass) {
        petClass += ` ${sizeClass}`;
      }
      
      // 容器尺寸样式 - 保留walkPosition的transform
      let containerStyle = '';
      
      // 构建transform样式，保留位移和方向
      const translateX = walkPosition || 0;
      const scaleX = walkDirection === 'right' ? 'scaleX(-1)' : 'scaleX(1)';
      
      // 处理尺寸缩放
      if (size === 'small') {
        containerStyle = `transform: translateX(${translateX}rpx) ${scaleX} scale(0.8);`;
      } else if (size === 'large') {
        containerStyle = `transform: translateX(${translateX}rpx) ${scaleX} scale(1.2);`;
      } else {
        containerStyle = `transform: translateX(${translateX}rpx) ${scaleX};`;
      }
      
      this.setData({
        petClass,
        wrapperClass: `stage-${stage}`, // 新增wrapper的class
        containerStyle
      });
    },
    
    // 开始动画
    startAnimations() {
      this.startBlinkAnimation();
      this.startRandomActions();
    },
    
    // 停止动画
    stopAnimations() {
      if (this.data.blinkTimer) {
        clearInterval(this.data.blinkTimer);
      }
      if (this.data.actionTimer) {
        clearTimeout(this.data.actionTimer);
      }
      if (this.data.animationTimer) {
        clearTimeout(this.data.animationTimer);
      }
      if (this.data.eggCrackTimer) {
        clearTimeout(this.data.eggCrackTimer);
      }
      if (this.data.layDownTimer) {
        clearTimeout(this.data.layDownTimer);
      }
      if (this.data.walkTimer) {
        clearTimeout(this.data.walkTimer);
      }
    },
    
    // 眨眼动画 - 通过切换图片实现
    startBlinkAnimation() {
      const blinkTimer = setInterval(() => {
        if (this.data.mood !== 'sleeping' && this.data.stage !== 'egg' && this.data.action !== 'laydown') {
          this.performBlink();
        }
      }, 3000 + Math.random() * 2000); // 3-5秒随机眨眼
      
      this.setData({ blinkTimer });
    },

    // 执行眨眼动作
    performBlink() {
      const { stage } = this.data;
      const basePath = 'cloud://cloud1-6g4qsd2kcddd1be0.636c-cloud1-6g4qsd2kcddd1be0-1370408816/pet_images';
      
      // 保存当前眼睛图片
      const originalEyesImage = this.data.eyesImage;
      
      // 切换到闭眼图片
      let blinkEyesImage = '';
      if (stage === 'baby') {
        blinkEyesImage = `${basePath}/babyEyesBlink_Normal@2x.png`;
      } else if (stage === 'child') {
        blinkEyesImage = `${basePath}/childEyesBlink_Normal@2x.png`;
      } else if (stage === 'adult') {
        blinkEyesImage = `${basePath}/eyesClosed_Normal@2x.png`;
      } else if (stage === 'elder') {
        blinkEyesImage = `${basePath}/elderEyesClosed_Normal@2x.png`;
      }
      
      if (blinkEyesImage) {
        this.setData({
          eyesImage: blinkEyesImage,
          eyesClass: 'blinking'
        });
        
        // 200ms后恢复睁眼
        setTimeout(() => {
          this.setData({
            eyesImage: originalEyesImage,
            eyesClass: ''
          });
        }, 200);
      }
    },
    
    // 随机动作
    startRandomActions() {
      const scheduleNextAction = () => {
        const actionTimer = setTimeout(() => {
          this.performRandomAction();
          scheduleNextAction();
        }, 5000 + Math.random() * 10000); // 5-15秒随机动作
        
        this.setData({ actionTimer });
      };
      
      scheduleNextAction();
    },
    
    // 执行随机动作
    performRandomAction() {
      if (this.data.stage === 'egg') return;
      
      // 只有adult阶段才有laydown动作，其他阶段只有idle、walking、jumping
      let actions;
      if (this.data.stage === 'adult') {
        actions = ['idle', 'walking', 'jumping', 'laydown'];
      } else {
        actions = ['idle', 'walking', 'jumping'];
      }
      
      if (this.data.mood !== 'sleeping') {
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        this.performAction(randomAction);
      }
    },
    
    // 执行动作
    performAction(action, duration = 2000) {
      this.setData({ action });
      this.updateImages();
      this.updateStyles();
      
      // 动作持续时间后恢复idle状态
      const animationTimer = setTimeout(() => {
        this.setData({ action: 'idle' });
        this.updateImages();
        this.updateStyles();
      }, duration);
      
      this.setData({ animationTimer });
    },
    
    // 显示互动效果
    showEffect(effectType, duration = 2000) {
      const effectData = {};
      effectData[`show${effectType.charAt(0).toUpperCase() + effectType.slice(1)}`] = true;
      effectData[`${effectType}Class`] = 'show';
      
      this.setData(effectData);
      
      setTimeout(() => {
        const hideData = {};
        hideData[`show${effectType.charAt(0).toUpperCase() + effectType.slice(1)}`] = false;
        hideData[`${effectType}Class`] = '';
        this.setData(hideData);
      }, duration);
    },
    
    // 喂食动画 - 不打断行走，支持过度喂食表情
    feed(isOverfed = false) {
      // 如果过度喂食，设置特殊表情
      if (isOverfed) {
        this.setData({ mood: 'overfed' });
        this.updateImages();
        
        // 开始监听宠物状态变化，当健康值或活力值不再是100时恢复表情
        this.startOverfedMonitoring();
      }
      
      // 直接设置eating动作和更新图片，不调用performAction避免干扰走路
      this.setData({ action: 'eating' });
      this.updateImages();
      
      this.showEffect('food', 1500);
      
      // 显示爱心效果（如果不是过度喂食）
      if (!isOverfed) {
        setTimeout(() => {
          this.showEffect('heart', 2000);
        }, 1000);
      }
      
      // 3秒后恢复idle状态
      const feedTimer = setTimeout(() => {
        this.setData({ action: 'idle' });
        this.updateImages();
      }, 3000);
      
      this.setData({ animationTimer: feedTimer });
    },

    // 开始监听过度喂食状态
    startOverfedMonitoring() {
      // 每5秒检查一次宠物状态
      const checkOverfedStatus = () => {
        const petData = this.data.petData;
        if (petData && (petData.health < 100 || petData.vitality < 100)) {
          // 健康值或活力值不再是100，恢复正常表情
          this.setData({ mood: 'happy' });
          this.updateImages();
          return; // 停止监听
        }
        
        // 继续监听
        setTimeout(checkOverfedStatus, 5000);
      };
      
      // 开始监听
      setTimeout(checkOverfedStatus, 5000);
    },
    
    // 互动动画 - 不打断行走
    play() {
      this.showEffect('heart', 2000);
      
      // 摇尾巴效果
      if (this.data.stage !== 'egg' && this.data.stage !== 'baby') {
        this.setData({
          tailClass: 'wagging'
        });
        
        setTimeout(() => {
          this.setData({
            tailClass: ''
          });
        }, 3000);
      }
      
      // 不需要暂停和恢复走动，让宠物继续行走
    },
    
    // 行走动画（手动触发）
    walk() {
      // 暂停自动走动
      this.stopAutoWalk();
      this.performWalkAnimation();
      
      // 5秒后恢复自动走动
      setTimeout(() => {
        this.startAutoWalk();
      }, 5000);
    },
    
    // 执行walk动画（3张图片循环）
    performWalkAnimation() {
      this.setData({ action: 'walking' });
      
      let frameIndex = 1;
      let walkDirection = 1; // 1为向右，-1为向左
      let currentPosition = 0; // 当前位置
      const basePath = 'cloud://cloud1-6g4qsd2kcddd1be0.636c-cloud1-6g4qsd2kcddd1be0-1370408816/pet_images';
      const { stage } = this.data;
      const maxDistance = 100; // 最大移动距离(rpx)
      
      const animateWalk = () => {
        // 根据阶段生成对应的walk图片路径
        let walkImagePath;
        if (stage === 'baby') {
          walkImagePath = `${basePath}/babyWalk${frameIndex}_Normal@2x.png`;
        } else if (stage === 'child') {
          walkImagePath = `${basePath}/childWalk${frameIndex}_Normal@2x.png`;
        } else if (stage === 'adult') {
          walkImagePath = `${basePath}/adultWalk${frameIndex}_Normal@2x.png`;
        } else if (stage === 'elder') {
          walkImagePath = `${basePath}/elderWalk${frameIndex}_Normal@2x.png`;
        }
        
        // 更新位置
        currentPosition += walkDirection * 10; // 每次移动10rpx
        
        // 检查边界并改变方向
        if (currentPosition >= maxDistance) {
          walkDirection = -1;
          currentPosition = maxDistance;
        } else if (currentPosition <= -maxDistance) {
          walkDirection = 1;
          currentPosition = -maxDistance;
        }
        
        this.setData({
          bodyImage: walkImagePath,
          walkPosition: currentPosition,
          walkDirection: walkDirection > 0 ? 'right' : 'left'
        });
        
        frameIndex++;
        // 根据不同阶段设置不同的图片数量
        let maxFrames = 3; // baby, child, elder 默认3张
        if (stage === 'adult') {
          maxFrames = 4; // adult有4张图片
        }
        
        if (frameIndex > maxFrames) {
          frameIndex = 1; // 循环播放
        }
        
        const walkTimer = setTimeout(() => {
          animateWalk();
        }, 400); // 每帧400ms
        
        this.setData({ walkTimer });
      };
      
      animateWalk();
      
      // 5秒后停止动画并恢复idle状态
      setTimeout(() => {
        if (this.data.walkTimer) {
          clearTimeout(this.data.walkTimer);
        }
        this.setData({ 
          action: 'idle',
          walkTimer: null,
          walkPosition: 0,
          walkDirection: 'right'
        });
        this.updateImages();
        this.updateStyles();
      }, 5000);
    },
    
    // 跳跃动画 - 保持当前方向并重置位置
    jump() {
      // 暂停自动走动
      this.pauseAutoWalk();
      
      // 保存当前方向，跳跃后不改变方向
      const currentDirection = this.data.walkDirection;
      this.performAction('jumping', 2000);
      
      // 确保跳跃后保持原来的方向并重置位置到中心
      setTimeout(() => {
        this.setData({ 
          walkDirection: currentDirection,
          walkPosition: 0  // 重置位置到中心
        });
        this.updateStyles();
        
        // 恢复自动走动
        setTimeout(() => {
          this.resumeAutoWalk();
        }, 500);
      }, 2100);
    },
    
    // 趴下动画 - 只有adult阶段支持
    layDown() {
      if (this.data.stage === 'adult') {
        this.performAdultLayDownAnimation();
      }
      // 其他阶段不执行laydown动作
    },
    
    // 成年猫趴下动画（四张图片循环）
    performAdultLayDownAnimation() {
      this.setData({ action: 'laydown' });
      
      let frameIndex = 1;
      const basePath = 'cloud://cloud1-6g4qsd2kcddd1be0.636c-cloud1-6g4qsd2kcddd1be0-1370408816/pet_images';
      
      const animateLayDown = () => {
        this.setData({
          bodyImage: `${basePath}/layDownAdult${frameIndex}_Normal@2x.png`
        });
        
        frameIndex++;
        if (frameIndex > 4) {
          frameIndex = 1; // 循环播放
        }
        
        const layDownTimer = setTimeout(() => {
          animateLayDown();
        }, 500); // 每帧500ms
        
        this.setData({ layDownTimer });
      };
      
      animateLayDown();
      
      // 4秒后停止动画并恢复idle状态
      setTimeout(() => {
        if (this.data.layDownTimer) {
          clearTimeout(this.data.layDownTimer);
        }
        this.setData({ 
          action: 'idle',
          layDownTimer: null
        });
        this.updateImages();
        this.updateStyles();
      }, 4000);
    },
    
    // 游戏动画 - 不打断行走
    playGame() {
      this.showEffect('laser', 3000);
      // 不需要暂停和恢复走动，让宠物继续行走
    },

    // 散步动画 - 不打断行走
    walkWithPet() {
      // 散步时不需要特殊处理，让宠物继续正常行走即可
      // 可以显示一些特效表示在散步
      this.showEffect('heart', 2000);
    },
    
    // 便便动画
    poop() {
      this.showEffect('poop', 5000);
      setTimeout(() => {
        this.setData({
          showStink: true,
          stinkClass: 'show'
        });
        
        setTimeout(() => {
          this.setData({
            showStink: false,
            stinkClass: ''
          });
        }, 3000);
      }, 500);
    },
    
    // 点击蛋事件
    onEggTap() {
      if (this.data.stage === 'egg' && !this.data.isEggCracking) {
        this.startEggCrackAnimation();
      }
    },
    
    // 开始蛋破碎动画
    startEggCrackAnimation() {
      this.setData({
        isEggCracking: true,
        eggCrackFrame: 1
      });
      
      const animateEggCrack = () => {
        const { eggCrackFrame } = this.data;
        const basePath = 'cloud://cloud1-6g4qsd2kcddd1be0.636c-cloud1-6g4qsd2kcddd1be0-1370408816/pet_images';
        
        if (eggCrackFrame <= 13) {
          // 更新蛋的图片
          this.setData({
            bodyImage: `${basePath}/egg${eggCrackFrame}_Normal@2x.png`,
            eggCrackFrame: eggCrackFrame + 1
          });
          
          // 设置下一帧动画
          const eggCrackTimer = setTimeout(() => {
            animateEggCrack();
          }, 150); // 每帧150ms
          
          this.setData({ eggCrackTimer });
        } else {
          // 动画结束，孵化成baby
          this.hatchEgg();
        }
      };
      
      animateEggCrack();
    },
    
    // 蛋孵化完成
    hatchEgg() {
      this.setData({
        isEggCracking: false,
        stage: 'baby',
        level: 1,  // 孵化后从1级开始，符合幼猫阶段(1-3级)
        eggCrackFrame: 1
      });
      
      // 清除定时器
      if (this.data.eggCrackTimer) {
        clearTimeout(this.data.eggCrackTimer);
      }
      
      // 更新图片和样式
      this.updateImages();
      this.updateStyles();
      
      // 显示孵化成功效果
      this.showEffect('heart', 3000);
      
      // 孵化后开始自动走动
      setTimeout(() => {
        this.startAutoWalk();
      }, 2000);
      
      // 触发升级事件给父组件
      this.triggerEvent('hatch', {
        newStage: 'baby',
        newLevel: 1
      });
    },
    
    // 升级动画
    levelUp() {
      this.setData({
        petClass: this.data.petClass + ' excited'
      });
      
      this.showEffect('heart', 3000);
      
      setTimeout(() => {
        this.updatePetAppearance(this.data.petData);
      }, 1000);
    },
    
    // 开始自动走动
    startAutoWalk() {
      if (this.data.stage === 'egg' || this.data.isAutoWalking) {
        return;
      }
      
      console.log('🚶 开始自动走动，当前阶段:', this.data.stage);
      this.setData({ isAutoWalking: true });
      this.performAutoWalk();
      this.scheduleRandomLayDown();
    },
    
    // 停止自动走动
    stopAutoWalk() {
      this.setData({ isAutoWalking: false });
      
      // 清除所有定时器
      if (this.data.autoWalkTimer) {
        clearTimeout(this.data.autoWalkTimer);
      }
      if (this.data.behaviorTimer) {
        clearTimeout(this.data.behaviorTimer);
      }
      if (this.data.layDownTimer) {
        clearTimeout(this.data.layDownTimer);
      }
      
      // 重置位置
      this.setData({
        walkPosition: 0,
        walkDirection: 'right',
        action: 'idle'
      });
      // 更新样式以应用重置的位置
      this.updateStyles();
      this.updateImages();
      this.updateStyles();
    },

    // 暂停自动走动（保持当前位置）
    pauseAutoWalk() {
      if (!this.data.isAutoWalking) return;
      
      // 清除定时器但保持状态
      if (this.data.autoWalkTimer) {
        clearTimeout(this.data.autoWalkTimer);
      }
      if (this.data.behaviorTimer) {
        clearTimeout(this.data.behaviorTimer);
      }
      if (this.data.layDownTimer) {
        clearTimeout(this.data.layDownTimer);
      }
      
      // 设置为idle状态但保持位置
      this.setData({ 
        action: 'idle',
        autoWalkTimer: null,
        behaviorTimer: null,
        layDownTimer: null
      });
      this.updateImages();
    },

    // 恢复自动走动
    resumeAutoWalk() {
      if (!this.data.isAutoWalking) return;
      
      // 恢复自动走动
      this.performAutoWalk();
      this.scheduleRandomLayDown();
    },
    
    // 执行自动走动
    performAutoWalk() {
      if (!this.data.isAutoWalking || this.data.stage === 'egg') {
        return;
      }
      
      console.log('🎬 执行自动走动动画，当前位置:', this.data.walkPosition, '方向:', this.data.walkDirection);
      this.setData({ action: 'walking' });
      
      let frameIndex = 1;
      let walkDirection = this.data.walkDirection === 'right' ? 1 : -1;
      let currentPosition = this.data.walkPosition;
      const { stage } = this.data;
      const basePath = 'cloud://cloud1-6g4qsd2kcddd1be0.636c-cloud1-6g4qsd2kcddd1be0-1370408816/pet_images';
      const maxDistance = 150; // 最大移动距离(rpx)
      const walkSpeed = 8; // 移动速度
      
      const animateAutoWalk = () => {
        if (!this.data.isAutoWalking) {
          return;
        }
        
        let walkImagePath;
        
        // 根据不同阶段设置不同的图片路径
        switch(stage) {
          case 'baby':
            walkImagePath = `${basePath}/babyWalk${frameIndex}_Normal@2x.png`;
            break;
          case 'child':
            walkImagePath = `${basePath}/childWalk${frameIndex}_Normal@2x.png`;
            break;
          case 'adult':
            walkImagePath = `${basePath}/adultWalk${frameIndex}_Normal@2x.png`;
            break;
          case 'elder':
            walkImagePath = `${basePath}/elderWalk${frameIndex}_Normal@2x.png`;
            break;
          default:
            walkImagePath = `${basePath}/babyWalk${frameIndex}_Normal@2x.png`;
        }
        
        // 更新位置
        currentPosition += walkDirection * walkSpeed;
        
        // 检查边界并改变方向（回头）
        if (currentPosition >= maxDistance) {
          walkDirection = -1;
          currentPosition = maxDistance;
          console.log('🔄 到达右边界，回头向左');
        } else if (currentPosition <= -maxDistance) {
          walkDirection = 1;
          currentPosition = -maxDistance;
          console.log('🔄 到达左边界，回头向右');
        }
        
        console.log('📍 位置更新:', currentPosition, '方向:', walkDirection > 0 ? 'right' : 'left');
        
        const direction = walkDirection > 0 ? 'right' : 'left';
        const scaleX = direction === 'right' ? 'scaleX(-1)' : 'scaleX(1)';
        
        // 保持尺寸缩放设置
        const { size } = this.data;
        let transformStyle;
        if (size === 'small') {
          transformStyle = `translateX(${currentPosition}rpx) ${scaleX} scale(0.8)`;
        } else if (size === 'large') {
          transformStyle = `translateX(${currentPosition}rpx) ${scaleX} scale(1.2)`;
        } else {
          transformStyle = `translateX(${currentPosition}rpx) ${scaleX}`;
        }
        
        const updateData = {
          bodyImage: walkImagePath,
          walkPosition: currentPosition,
          walkDirection: direction,
          containerStyle: `transform: ${transformStyle};`
        };
        
        console.log('🔄 setData 调用:', updateData);
        this.setData(updateData);
        
        // 验证数据是否正确设置
        setTimeout(() => {
          console.log('✅ 当前 data.walkPosition:', this.data.walkPosition);
        }, 50);
        
        frameIndex++;
        // 根据不同阶段设置不同的图片数量
        let maxFrames = 3; // baby, child, elder 默认3张
        if (stage === 'adult') {
          maxFrames = 4; // adult有4张图片
        }
        
        if (frameIndex > maxFrames) {
          frameIndex = 1; // 循环播放
        }
        
        const autoWalkTimer = setTimeout(() => {
          animateAutoWalk();
        }, 300); // 每帧300ms，比手动走动稍快
        
        this.setData({ autoWalkTimer });
      };
      
      animateAutoWalk();
    },
    
    // 安排随机趴下动作
    scheduleRandomLayDown() {
      if (!this.data.isAutoWalking) {
        return;
      }
      
      // 随机15秒后执行趴下动作
      const randomDelay = Math.random() * 10000 + 10000; // 10-20秒随机
      
      const behaviorTimer = setTimeout(() => {
        if (this.data.isAutoWalking) {
          this.performRandomLayDown();
        }
      }, randomDelay);
      
      this.setData({ behaviorTimer });
    },
    
    // 执行随机趴下动作
    performRandomLayDown() {
      if (!this.data.isAutoWalking) {
        return;
      }
      
      // 暂停走动
      if (this.data.autoWalkTimer) {
        clearTimeout(this.data.autoWalkTimer);
      }
      
      // 执行趴下动作
      this.setData({ action: 'laydown' });
      
      if (this.data.stage === 'adult') {
        this.performAdultLayDownAnimation();
      } else {
        this.performAction('laydown', 15000); // 趴下15秒
      }
      
      // 15秒后恢复走动
      const layDownTimer = setTimeout(() => {
        if (this.data.isAutoWalking) {
          this.setData({ action: 'idle' });
          this.updateImages();
          this.updateStyles();
          this.performAutoWalk();
          this.scheduleRandomLayDown(); // 安排下一次随机趴下
        }
      }, 15000);
      
      this.setData({ layDownTimer });
    }
  }
});