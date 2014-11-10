/**
 * @author Arnaud Buathier
 * @link http://gwbbcode.arnapou.net/
 * @version v1.0
 */

/**
 * Config Object
 */
var GWConfig = {
	css: {
		theme: 'http://gwbbcode.arnapou.net/gwbbcode/themes/arnapou/theme.css',
		skills: 'http://gwbbcode.arnapou.net/gwbbcode/skills/skills.css'
	},
	js: {
		data: {
			fr: 'http://gwbbcode.arnapou.net/gwbbcode/data/fr.js',
			en: 'http://gwbbcode.arnapou.net/gwbbcode/data/en.js'
		},
		jQuery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js'
	},
	db: {
		attributes: {},
		professions: {},
		skills: {},
		search: {}
	},
	templates: {
		skill: '<span class="skill skillPack[pack] skill[id] [cls]"><span class="skill-[type]"></span><span class="skill-[elite]"></span></span>',
		detail: '<div class="gw-skill-detail gw-skill-[elite] gw-skill[prof]"><div class="gw-skill-panel">[skill][caracs]</div><div class="gw-skill-desc"><div class="gw-skill-name">[name]</div><div class="gw-skill-type">[type]</div><div class="gw-skill-text">[text]</div></div><div class="gw-skill-bottom"><div class="gw-skill-attr">[attr]</div><div class="gw-skill-chap">[chap]</div></div></div>',
		build: '<div class="gw-build gw-count[count] [attrs]"><div class="gw-panel"><div class="gw-prof"><span class="gw-prof[prof1]" title="[profname1]"></span><span class="gw-prof[prof2]" title="[profname2]"></span></div></div><span class="gw-container"><span class="gw-skills"><span class="gw-skills-left"></span><span class="gw-skills-center">[skills]</span><span class="gw-skills-right"></span></span><span class="gw-template">[template]</span></span></div>'
	},
	detail: {
		offset : {
			x: 5,
			y: 5
		}
	},
	forceFullBar : true,
	lang: 'en',
	loaded: false
};
/**
 * Class GWBuild
 */
function GWBuild() {
	var _self = this;
	var _base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	var _professions, _attributes, _attributeValues, _skills;
	
	function binpadright(s, n) {
		while(s.length < n) s += '0';
		return s;
	}
	function valbin(v, n) {
		return binpadright(strrev(parseInt(v).toString(2)), n);
	}
	function binval(b) {
		return parseInt(strrev(b), 2);
	}
	function arraymax(a) {
		var max = 0, n = a.length;
		for(var i = 0; i < n; i++) if(a[i] > max) max = a[i];
		return max;
	}
	function nbytes(v) {
		var n = 0;
		while(v != 0) {
			v = Math.floor(v/2);
			n++;
		}
		return n == 0 ? 11 : n;
	}
	function strrev(s) {
		return (s || '').split('').reverse().join('');
	}
	function charindex(c) {
		var n = _base64.length;
		for(var i = 0; i < n; i++) if(_base64.substr(i, 1) == c) return i;
	}
	function bintocode(bin) {
		var r = bin.length%6, c = '';
		if(r != 0) bin = binpadright(bin, bin.length + 6 - r);
		while(bin.length > 0) {
			c += _base64.substr(parseInt(strrev(bin.substr(0, 6)), 2), 1);
			bin = bin.substr(6);
		}
		return c;
	}
	function codetobin(c) {
		var n = c.length, bin = '';
		for(var i = 0; i < n; i++){
			bin += valbin(charindex(c.substr(i, 1)), 6);
		}
		return bin;
	}
	
	function sanitizeprof(prof) {
		if(prof.length == 1) {
			prof = prof.toUpperCase();
		}
		else if(prof.length > 1) {
			prof = (prof[0]+'').toUpperCase()+ prof.substr(1).toLowerCase();;
		}
		return prof;
	}
	function sanitizeattr(attr) {
		attr = (attr+'').toLowerCase();
		return attr;
	}
	
	this.setProfession1 = function(prof) {
		prof = sanitizeprof(prof);
		if(GWConfig.db.professions[prof]) {
			_self._professions[0] = parseInt(GWConfig.db.professions[prof]);
		}
	};
	this.setProfession2 = function(prof) {
		prof = sanitizeprof(prof);
		if(GWConfig.db.professions[prof]) {
			_self._professions[1] = parseInt(GWConfig.db.professions[prof]);
		}
	};
	this.findProfessionByInt = function(i) {
		for(var prof in GWConfig.db.professions){
			if(typeof(GWConfig.db.professions[prof]) != 'function') {
				if(GWConfig.db.professions[prof] == i) return prof;
			}
		}
		return null;
	};
	this.getProfession1 = function() {
		return _self.findProfessionByInt(_self._professions[0]);
	};
	this.getProfession2 = function() {
		return _self.findProfessionByInt(_self._professions[1]);
	};
	this.findAttributeByInt = function(i) {
		for(var attr in GWConfig.db.attributes){
			if(typeof(GWConfig.db.attributes[attr]) != 'function') {
				if(GWConfig.db.attributes[attr] == i) return attr;
			}
		}
		return null;
	};
	this.getAttributevalue = function(attr) {
		attr = sanitizeattr(attr);
		var attrid = GWConfig.db.attributes[attr];
		if(attrid) {
			for(var i in _self._attributes) {
				if(typeof(_self._attributes[i]) != 'function') {
					if(_self._attributes[i] == attrid) return _self._attributeValues[i];
				}
			}
		}
		return 0;
	};
	this.getAttributes = function() {
		var attributes = {}, n = _self._attributes.length;
		for(var i = 0; i < n; i++){
			attributes[_self.findAttributeByInt(_self._attributes[i])] = _self._attributeValues[i];
		}
		return attributes;
	};
	this.getSkills = function(){
		var skills = [], n = _self._skills.length;
		for(var i = 0; i < n; i++){
			skills.push(_self.getSkill(i));
		}
		return skills;
	};
	this.getSkill = function(index) {
		var skill = new GWSkill();
		var id = _self._skills[index];
		if(id > 0) {
			skill.setId(id);
		}
		skill.attrlevel = _self.getAttributevalue(skill.attr);
		return skill;
	};
	this.addAttribute = function(attribute, value) {
		attribute = sanitizeattr(attribute);
		if((value+'').match(/\+/)) {
			var a = value.split('+');
			value = 0;
			for(var i = 0; i < a.length; i++) value += parseInt(a[i]);
		}
		var attributeid = GWConfig.db.attributes[attribute];
		if(!attributeid) {
			// try to find attribute (example : protection => pro)
			for(var n=6; n>=3; n--) {
				for(var i in GWConfig.db.attributes) {
					if(typeof(i) == 'string') {
						if(attribute.substr(0, n).toLowerCase() == i) {
							attributeid = GWConfig.db.attributes[i];
						}
					}
				}
			}
		}
		if(attributeid) {
			_self._attributes.push(parseInt(attributeid));
			_self._attributeValues.push(parseInt(value));
		}
	};
	this.setSkillName = function(index, name) {
		var key = (name+'').replace(/[^a-z]/gi, '');
		if(GWConfig.db.search[key]) {
			_self._skills[index] = parseInt(GWConfig.db.search[key]);
		}
	};
	this.clear = function() {
		_self._professions = [0, 0];
		_self._attributes = [];
		_self._attributeValues = [];
		_self._skills = [0,0,0,0,0,0,0,0];
	};
	this.getTemplate = function() {
		var nbattr = _self._attributes.length;
		var bin = '0111000000';
		bin += valbin(_self._professions[0], 4);
		bin += valbin(_self._professions[1], 4);
		bin += valbin(nbattr, 4);
		bin += valbin(2, 4);
		for(var i=0; i < nbattr; i++){
			bin += valbin(_self._attributes[i], 6);
			bin += valbin(_self._attributeValues[i], 4);
		}
		var max = arraymax(_self._skills);
		var n = nbytes(max);
		bin += valbin(n-8, 4);
		for(var i=0; i < 8; i++){
			bin += valbin(_self._skills[i], n);
		}
		return bintocode(bin);
	};
	this.setTemplate = function(t) {
		t = t.replace(/^\s*/g, '').replace(/\s*$/g, '');
		_self.clear();
		var bin = codetobin(t);
		if(bin.substr(0, 4) == '0111') bin = bin.substr(4);
		if(bin.length < 23) return;
		if(bin.substr(0, 6) != '000000') return;
		bin = bin.substr(6);
		_self._professions[0] = binval(bin.substr(0, 4));
		_self._professions[1] = binval(bin.substr(4, 4));
		var nbattr = binval(bin.substr(8, 4));
		var attrsize = 4 + binval(bin.substr(12, 4));
		bin = bin.substr(16);
		for(var i = 0; i < nbattr; i++) {
			_self._attributes.push(binval(bin.substr(0, attrsize)));
			_self._attributeValues.push(binval(bin.substr(attrsize, 4)));
			bin = bin.substr(4 + attrsize);
		}
		if(bin.length < 4) return;
		var skillsize = 8 + binval(bin.substr(0, 4));
		bin = bin.substr(4);
		for(var i = 0; i < 8; i++) {
			if(bin.length < skillsize) return;
			_self._skills[i] = binval(bin.substr(0, skillsize));
			bin = bin.substr(skillsize);
		}
	};
	this.getHtml = function(){
		var skills = _self.getSkills(), tplskills = '';
		for(var i in skills) {
			if(typeof(skills[i]) != 'function') {
				if(GWConfig.forceFullBar || _self._skills[i]) {
					tplskills += skills[i].getHtml();
				}
			}
		}
		var attributes = _self.getAttributes();
		var attrs = '';
		for(var i in attributes) {
			if(typeof(attributes[i]) != 'function') {
				attrs += ' gw-attr-'+i+'-'+attributes[i];
			}
		}
		var tpl = GWConfig.templates.build;
		tpl = tpl.replace('[count]', GWConfig.forceFullBar ? 8 : _self.skillsCount());
		tpl = tpl.replace('[attrs]', attrs || '');
		tpl = tpl.replace('[prof1]', GWConfig.db.professionkeys[_self.getProfession1()] || '');
		tpl = tpl.replace('[profname1]', GWConfig.db.professionnames[_self.getProfession1()] || '');
		tpl = tpl.replace('[prof2]', GWConfig.db.professionkeys[_self.getProfession2()] || '');
		tpl = tpl.replace('[profname2]', GWConfig.db.professionnames[_self.getProfession2()] || '');
		tpl = tpl.replace('[template]', _self.getTemplate());
		tpl = tpl.replace('[skills]', tplskills);
		return tpl;
	};
	this.skillsCount = function() {
		var n = 0;
		for(var i = 0; i < _self._skills.length; i++) if(_self._skills[i]) n++;
		return n;
	};
	_self.clear();
}
/**
 * Class GWSkill
 */
function GWSkill() {
	var _self = this;

	this.attrlevel = null;
	this.cls = null;
	
	this.id = null;
	this.profession = null;
	this.elite = null;
	this.name = null;
	this.description = null;
	this.type = null;
	this.ty = null;
	this.chapter = null;
	this.attribute = null;
	this.attr = null;
	this.caracs = null;
	
	this.setId = function(id) {
		var data = GWConfig.db.skills[id];
		if(data){
			var caracs = [];
			if(data.z) {
				if(data.z.s) caracs.sacrifice = data.z.s;
				if(data.z.x) caracs.exhaustion = data.z.x;
				if(data.z.g) caracs.eregen = data.z.g;
				if(data.z.e) caracs.energy = data.z.e;
				if(data.z.a) caracs.adrenaline = data.z.a;
				if(data.z.c) caracs.casting = data.z.c;
				if(data.z.r) caracs.recharge = data.z.r;
			}
			_self.id = id;
			_self.profession = data.p;
			_self.elite = data.e == 1;
			_self.name = data.n;
			_self.description = data.d;
			_self.type = data.t;
			_self.ty = data.y;
			_self.chapter = data.c;
			_self.attribute = data.a;
			_self.attr = data.b;
			_self.caracs = caracs;
		}
	};
	this.setName = function(name) {
		var key = (name+'').replace(/[^a-z]/gi, '');
		if(GWConfig.db.search[key]) {
			_self.setId(parseInt(GWConfig.db.search[key]));
		}
	};
	this.getHtml = function (){
		var tpl = GWConfig.templates.skill;
		tpl = tpl.replace('[pack]', _self.id ? Math.floor(_self.id/100) : '0');
		tpl = tpl.replace('[id]', _self.id || 'empty');
		tpl = tpl.replace('[cls]', _self.cls || '');
		tpl = tpl.replace('[type]', _self.ty);
		tpl = tpl.replace('[elite]', _self.elite ? 'elite' : 'noelite');
		return tpl;
	};
	this.getDescription = function(){
		var text = _self.description, m;
		text = text.replace(/([0-9]+\.\.\.?[0-9]+(?:\.\.\.?[0-9]+)?)/gi, '<b>$1</b>');
		if(_self.attrlevel){
			while(m = text.match(/([0-9]+)\.\.\.?([0-9]+)(?:\.\.\.?[0-9]+)?/i)) {
				var v0 = parseInt(m[1]);
				var v12 = parseInt(m[2]);
				var v = Math.floor((v12-v0)/12*_self.attrlevel + v0);
				text = text.replace(m[0], v);
			}
		}
		return text;
	};
	this.getCaracs = function(){
		var caracs = '';
		for(var i in _self.caracs) {
			if(typeof(_self.caracs[i]) != 'function') {
				caracs += '<li class="gw-carac-'+i+'"><span></span>'+_self.caracs[i]+'</li>';
			}
		}
		return '<ul>'+caracs+'</ul>';
	};
	this.getHtmlDetail = function() {
		var tpl = GWConfig.templates.detail;
		tpl = tpl.replace('[prof]', _self.profession);
		tpl = tpl.replace('[elite]', _self.elite ? 'elite' : 'noelite');
		tpl = tpl.replace('[name]', _self.name);
		tpl = tpl.replace('[type]', _self.type);
		tpl = tpl.replace('[attr]', (_self.attribute || '')+(_self.attrlevel ? ' <b>'+_self.attrlevel+'</b>': ''));
		tpl = tpl.replace('[chap]', _self.chapter);
		tpl = tpl.replace('[text]', _self.getDescription());
		tpl = tpl.replace('[caracs]', _self.getCaracs());
		tpl = tpl.replace('[skill]', _self.getHtml());
		return tpl;
	};
}
/**
 * Bind GW events
 */
function GWBindEvents(jQuerySelector){
	if(typeof(jQuerySelector) == "string") {
		jQuerySelector = jQuery(jQuerySelector);
	}
	jQuerySelector.find('.skill, .skill-text').each(function(){
		var cls = jQuery(this).get(0).className, m;
		if(m = cls.match(/skill([0-9]+)/i)) {
			var idskill = m[1];
			GWBindSkill(this, idskill);
		}
		else if(m = cls.match(/skill-text([0-9]+)/i)) {
			var idskill = m[1];
			GWBindSkill(this, idskill);
		}
	});
}
/**
 * Function to use on page load
 */
function GWOnLoad(callback){
	if(!GWConfig.loaded) {
		GWConfig.loaded = true;
		var addCss = function (href) {
			var headID = document.getElementsByTagName("head")[0] || document.documentElement;         
			var cssNode = document.createElement('link');
			cssNode.type = 'text/css';
			cssNode.rel = 'stylesheet';
			cssNode.href = href;
			cssNode.media = 'screen';
			headID.appendChild(cssNode);
		};
		var addJs = function (href, onload) {
			var headID = document.getElementsByTagName("head")[0] || document.documentElement;         
			var newScript = document.createElement('script');
			newScript.type = 'text/javascript';
			newScript.src = href;
			if(onload) {
				var done = false;
				newScript.onload = newScript.onreadystatechange = function() {
					if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
						done = true;
						onload();
						newScript.onload = newScript.onreadystatechange = null;
						if ( headID && newScript.parentNode ) {
							headID.removeChild( newScript );
						}
					}
				};
			}
			headID.appendChild(newScript);
		};
		var fnOnLoad = function() {
			jQuery(function(){
				addCss(GWConfig.css.theme);
				addCss(GWConfig.css.skills);
				jQuery.ajax({
					cache: true,
					url: GWConfig.js.data[GWConfig.lang],
					dataType: 'script',
					success: function(){
						if(callback) {
							callback();
						}
					}
				});
			});
		};
		// try to load jQuery if not exists
		if(typeof(jQuery) == 'undefined') {
			addJs(GWConfig.js.jQuery, function(){
				jQuery.noConflict();
				fnOnLoad();
			});
		}
		else {
			fnOnLoad();
		}
	}
}
/**
 * GWBBCode parser
 */
function GWBBCodeParse(jQuerySelector) {
	if(typeof(jQuerySelector) == "string") {
		jQuerySelector = jQuery(jQuerySelector);
	}
	jQuerySelector.each(function(){
		var i, m, m0, m1, m2, build, attr, cls, attrval,
		skillid, skill, skills, skillkey, match, attributes, content;
		var htmlsaved = jQuery(this).html();
		var html = htmlsaved;
		// protect nobb
		var protect = [];
		while(m = html.match(/\[nobb\].*?\[\/nobb\]/i)) {
			html = html.replace(m[0], '#NO-BB-'+protect.length+'#');
			protect.push(m[0]);
		}
		// go parse [build=xxxxx][/build]
		while(m = html.match(/\[build\s*=\s*([^\]]+)\]\[\/build\]/i)) {
			build = new GWBuild();
			build.setTemplate(m[1]);
			html = html.replace(m[0], build.getHtml());
		}
		// go parse [build=xxxxx]
		while(m = html.match(/\[build\s*=\s*([^\]]+)\]/i)) {
			build = new GWBuild();
			build.setTemplate(m[1]);
			html = html.replace(m[0], build.getHtml());
		}
		// go parse [build xxx][yyy][zzz]...[/build]
		while(m = html.match(/\[build([^\[]+)](.*?)\[\/build]/i)) {
			match = m[0];
			build = new GWBuild();
			attributes = m[1];
			content = GWSanitizeString(m[2].replace(/\[/g, '').replace(/\]$/, ''));
			while(m = attributes.match(/([a-z]+)=([a-z0-9+\/]+)/i)) {
				m0 = m[0];
				m1 = m[1];
				m2 = m[2];
				if(m1.match(/prof/i)) {					
					if(m = m2.match(/^([a-z]+)\/([a-z\?]*)$/i)) {
						build.setProfession1(m[1]);
						build.setProfession2(m[2]);
					}
					else if(m = m2.match(/^([a-z]+)$/i)) {
						build.setProfession1(m[1]);
					}
				}
				else if(m2.match(/^[0-9\+]+$/)) {
					build.addAttribute(m1, m2);
				}
				attributes = attributes.replace(m0, '');
			}
			skills = content.split(']');
			for(i in skills) {
				if(typeof(skills[i]) != 'function') {
					if(m = skills[i].match(/^(.*)\@([0-9]+)$/)){
						build.setSkillName(i, m[1]);
					}
					else {
						build.setSkillName(i, skills[i]);
					}
				}
			}
			html = html.replace(match, build.getHtml());
		}
		// go parse [[xxxxx]
		while(m = html.match(/\[\[(.*?)\]/i)) {
			match = m[0];
			skillkey = m[1];
			cls='';
			attrval='';
			if(m = m[1].match(/^(.*)\@([0-9]+)$/)){
				skillkey = m[1];
				attrval = m[2];
			}
			skillkey = GWSanitizeString(skillkey).replace(/[^a-z]+/g, '');
			if(GWConfig.db.search[skillkey]) {
				skillid = GWConfig.db.search[skillkey];
				if(attrval) {
					attr = GWConfig.db.skills[skillid].b;
					cls = 'gw-attr-'+attr+'-'+attrval;
				}
				html = html.replace(match, '<a href="javascript:void(0)" class="skill-text skill-text'+skillid+' '+cls+'">'+GWConfig.db.skills[skillid].n+'</a>');
			}
			else {
				html = html.replace(match, '#NO-BB-'+protect.length+'#');
				protect.push(match);
			}
		}
		// go parse [xxxxx]
		while(m = html.match(/\[(.*?)\]/i)) {
			match = m[0];
			skillkey = m[1];
			cls='';
			attrval='';
			if(m = m[1].match(/^(.*)\@([0-9]+)$/)){
				skillkey = m[1];
				attrval = m[2];
			}
			skillkey = GWSanitizeString(skillkey).replace(/[^a-z]+/g, '');
			if(GWConfig.db.search[skillkey]) {
				skillid = GWConfig.db.search[skillkey];
				if(attrval) {
					attr = GWConfig.db.skills[skillid].b;
					cls = 'gw-attr-'+attr+'-'+attrval;
				}
				skill = new GWSkill();
				skill.setId(skillid);
				skill.cls = cls;
				html = html.replace(match, skill.getHtml());
			}
			else {
				html = html.replace(match, '#NO-BB-'+protect.length+'#');
				protect.push(match);
			}
		}
		// put back nobb
		for(i = 0; i < protect.length; i++){
			html = html.replace('#NO-BB-'+i+'#', protect[i]);
		}
		if(html != htmlsaved) {
			jQuery(this).html(html);
			GWBindEvents(jQuerySelector);
		}
	});
}
/**
 * Bind a dom node with a skill
 */
function GWBindSkill(domobject, idskill) {
	var divId = '#skillDiv'+idskill;
	var $build = jQuery(domobject).parents('.gw-build');
	var skill = new GWSkill();
	skill.setId(idskill);
	if($build.length == 1) {
		var cls = $build.get(0).className, m;
		if(m = cls.match(new RegExp('gw-attr-'+skill.attr+'-([0-9]+)','i'))) {
			skill.attrlevel = m[1];
			divId += skill.attr + m[1];
		}
	}
	if(m = domobject.className.match(new RegExp('gw-attr-'+skill.attr+'-([0-9]+)','i'))) {
		skill.attrlevel = m[1];
		divId += skill.attr + m[1];
	}
	var $skillDiv = jQuery.find(divId);
	if($skillDiv.length == 0) {
		$skillDiv = jQuery(skill.getHtmlDetail());
		jQuery('body').append($skillDiv);
	}
	jQuery(domobject)
	.hover(function(){
		$skillDiv.show();
	},function(){
		$skillDiv.hide();
	})
	.mousemove(function(e){
		$skillDiv.css({
			left: (e.pageX+GWConfig.detail.offset.x)+'px',
			top: (e.pageY+GWConfig.detail.offset.y)+'px'
		})
	});
}
/**
 * Sanitize a string to recognize a skill name
 */
function GWSanitizeString(s) {
	var r=s.toLowerCase();
	r = r.replace(/\s/g,'');
	r = r.replace(/[àáâãäå]/g,'a');
	r = r.replace(/æ/g,'ae');
	r = r.replace(/ç/g,'c');
	r = r.replace(/[èéêë]/g,'e');
	r = r.replace(/[ìíîï]/g,'i');
	r = r.replace(/ñ/g,'n');                
	r = r.replace(/[òóôõö]/g,'o');
	r = r.replace(/œ/g,'oe');
	r = r.replace(/[ùúûü]/g,'u');
	r = r.replace(/[ýÿ]/g,'y');
	r = r.replace(/[\s\r\n\t]/g,'');
	return r;
}