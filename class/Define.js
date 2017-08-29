


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

	static get ITEM_EDGE_WIDTH(){
		return 14.5;
	}

	static get SCALE_HORIZONTAL(){
		return SCALE;
	}

	static get SCALE_MIN_PX_PER_US(){
		return 1/1000000;
	}

	static get SCALE_MAX_PX_PER_US(){
		return 10;
	}

	static get SCALE_MIN_US_PER_SCALE(){
		return 1;
	}

	static get SCALE_MAX_US_PER_SCALE(){
		return 10000000;
	}

	static get SCALE_HORIZONTAL_WIDTH_DEFAULT_INDEX(){
		return 15;
	}

	static get DATA(){
		return {
			ON : "on",
			OFF : "off",
		}
	}

	constructor() {
	}
}

var SCALE = [];
{
	var i = 0;
	while(1){
		var pxPerUs = Define.SCALE_MIN_PX_PER_US * Math.pow( 10, i/3 );
		var usPerScale = Define.SCALE_MAX_US_PER_SCALE / Math.pow( 10, Math.floor(i/3) );
		if( pxPerUs > Define.SCALE_MAX_PX_PER_US ){
			break;
		}else{
			SCALE.push({pxPerUs:pxPerUs,usPerScale:usPerScale});
		}
		i++;
	}
}
