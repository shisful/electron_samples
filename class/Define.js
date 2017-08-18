
export default class Define {

	static get VIEW_TYPE(){
		return {
			SAMPLE0 : 0
		}
	};

	static get DRAG_TARGET(){
		return {
			NONE  : 0,
			BODY  : 1,
			RIGHT : 2,
			LEFT  : 3,
		}
	};

	static get SCALE_VERTICAL_HEIGHT(){
		return 40;
	}

	static get SCALE_HORIZONTAL_WIDTH(){
		return 50;
	}

	constructor() {
	}
}
