// SoundManager 2: Page Player demo, MetaData UI prototype

/*jslint white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: false, bitwise: true, newcap: true, immed: true */
/*global pagePlayer, document, window */

var Metadata = function(oSound) {

  var self = this,
      pl = pagePlayer,
      oLI = oSound._data.oLI,
      o = oLI.getElementsByTagName('ul')[0],
      oItems = o.getElementsByTagName('li'),
      oTemplate = document.createElement('div'),
      oTemplate2 = document.createElement('div'),
      oTemplate3 = document.createElement('div'),
      oTemplate4 = document.createElement('div'),
      oDuration, i;

  oTemplate.innerHTML = '<span>&nbsp;</span>';
  oTemplate.className = 'annotation';
  oTemplate2.innerHTML = '<span>&nbsp;</span>';
  oTemplate2.className = 'annotation alt';
  oTemplate3.className = 'note';
  oTemplate4.className = 'bar';

  this.totalTime = 0;
  this.data = [];
  this.data.givenDuration = null;
  this.data.currentItem = null;
  this.data.mainTitle = oSound._data.oLink.innerHTML;
  $('.score').text('0');

  this.strToTime = function(sTime) {
    var segments = sTime.split(':'),
        seconds = 0, i;
    for (i=segments.length; i--;) {
      seconds += parseInt(segments[i],10)*Math.pow(60,segments.length-1-i); // hours, minutes
    }
    return seconds;
  };

  // make stuff
  this.createElements = function() {
    var oFrag = document.createDocumentFragment(),
        oNode = null,
        oNodeSpan = null,
        oNode2 = null,
        i,
        oNode3 = null;
    for (i=0; i<self.data.length; i++) {
      oNode = (i%2===0?oTemplate:oTemplate2).cloneNode(true);
      oNodeSpan = oNode.getElementsByTagName('span')[0];
      oNode.rel = i;
      self.data[i].o = oNode;
      oNode2 = oTemplate3.cloneNode(true);
      oNode3 = oTemplate4.cloneNode(true);
      if (i%2===0) {
        oNode2.className = 'note alt';
        oNode3.className = 'bar alt';
      }
      oNode2.innerHTML = this.data[i].title;
//      oNode3.innerHTML = this.data[i].title;
      // evil old-skool event handlers, css:hover-only ideally would be nice excluding IE 6
      oNode.onmouseover = self.mouseover;
      oNode.onmouseout = self.mouseout;
      this.data[i].oNote = oNode2;
      this.data[i].changeBlock = oNode3;
      this.data[i].changeBlock.style.visibility = 'hidden';
      this.data[i].changeBlock.style.display = 'inline-block';
      this.data[i].changeBlock.style.marginLeft = -parseInt(this.data[i].changeBlock.offsetWidth/2,10)+'px';
      this.data[i].changeBlock.style.visibility = 'visible';
      oSound._data.oControls.appendChild(oNode2);
      oSound._data.oControls.appendChild(oNode3);
      oFrag.appendChild(oNode);
    }
    self.refresh();
    oSound._data.oStatus.appendChild(oFrag);
  };

  this.refreshMetadata = function(oSound) {
    // Display info as appropriate
    var i, j, index = null,
        now = oSound.position,
        metadata = oSound._data.metadata.data;
    for (i=0, j=metadata.length; i<j; i++) {
      if (now >= metadata[i].startTimeMS && now <= metadata[i].endTimeMS) {
        index = i;
        break;
      }
    }

//    var redFun = function makeRed() {
//        $(this).css('color', 'purple');
//    }
//    var whiteFun = function makeWhite() {
//        $(this).css('color', 'orange');
//    }

    if (index !== metadata.currentItem) {
        var withDivs = '';
        var divId = oLI.getElementsByTagName('div')[0].id;
        var totalPoints = oLI.getElementsByTagName('span').length;
        var split = metadata[index].title.split(" ");
        for (k = 0; k < split.length; k++) {
            withDivs = withDivs + '<span class="words">&nbsp;&nbsp;&nbsp;<span id="' + divId + '" class="sm2_metadata" style="color: white;" onclick="javascript:toggle(event)">' + split[k] + '</span></span>';
        }
      // update
      $('.words').remove();
      $('#' + divId).before(withDivs);
//      oSound._data.oLink.innerHTML = metadata.mainTitle+' <span class="sm2_divider"> | </span>' +
//          '<div class="metadata">'+ '' +'</div>';
      pl.setPageTitle(metadata[index].title+' | ' + metadata.mainTitle);
      metadata.currentItem = index;
    }
  };

  this.refresh = function() {
    var offset = 0,
        relWidth = null,
        duration = (self.data.givenDuration?self.data.givenDuration:oSound.durationEstimate), i;
    for (i=0; i<self.data.length; i++) {
      if (duration) {
        relWidth = (((self.data[i].duration*1000)/duration)*100);
        self.data[i].o.style.left = (offset?offset+'%':'-2px');
        self.data[i].oNote.style.left = (offset?offset+'%':'0px');
        self.data[i].changeBlock.style.left = (offset?offset+'%':'0px');
        offset += relWidth;
      }
    }
  };

  this.mouseover = function(e) {
    self.data[this.rel].oNote.style.visibility = 'hidden';
    self.data[this.rel].oNote.style.display = 'inline-block';
    self.data[this.rel].oNote.style.marginLeft = -parseInt(self.data[this.rel].oNote.offsetWidth/2,10)+'px';
    self.data[this.rel].oNote.style.visibility = 'visible';

  };

  this.mouseout = function() {
    self.data[this.rel].oNote.style.display = 'none';
  };

  // ----

  for (i=0; i<oItems.length; i++) {
    this.data[i] = {
      o: null,
      title: oItems[i].getElementsByTagName('p')[0].innerHTML,
      startTime: oItems[i].getElementsByTagName('span')[0].innerHTML,
      startSeconds: self.strToTime(oItems[i].getElementsByTagName('span')[0].innerHTML.replace(/[()]/g,'')),
      duration: 0,
      durationMS: null,
      startTimeMS: null,
      endTimeMS: null,
      oNote: null,
      changeBlock: null
    };
  }

  oDuration = pl.getByClassName('duration','div',oLI);
  this.data.givenDuration = (oDuration.length?self.strToTime(oDuration[0].innerHTML)*1000:0);

  for (i=0; i<this.data.length; i++) {
    this.data[i].duration = parseInt(this.data[i+1]?this.data[i+1].startSeconds:(self.data.givenDuration?self.data.givenDuration:oSound.durationEstimate)/1000,10)-this.data[i].startSeconds;
    this.data[i].startTimeMS = this.data[i].startSeconds*1000;
    this.data[i].durationMS = this.data[i].duration*1000;
    this.data[i].endTimeMS = this.data[i].startTimeMS+this.data[i].durationMS;
    this.totalTime += this.data[i].duration;
  }

  // ----

  this.createElements();
  this.refresh();
  
}; // MetaData();