$(window).on('resize',function() {
    var docHeight = $(window).height();
    var footerHeight = $('#footer').height();
    // var footerTop = $('#footer').position().top + footerHeight;

    // if (footerTop < docHeight) {
    //     $('#footer').css('margin-top', -30 + (docHeight - footerTop) + 'px');
    // }
});
$(document).ready(function() {
    $(window).trigger('resize');
});


if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP    = function() {},
            fBound  = function() {
                return fToBind.apply(this instanceof fNOP && oThis
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

var dagred3Story = function(svgelement, graphType, interframetime) {
    this.interframetime = interframetime;
    this.lastrenderTime = null;
    this.g = new dagreD3.graphlib.Graph().setGraph({});

    this.g.setDefaultEdgeLabel(function() { return {}; });
    this.g.graph().marginx = 10;
    this.g.graph().marginy = 10;
    switch(graphType) {
        case 'Work Breakdown Structure':
            this.WBS = true;
            this.Schedule = false;
            this.g.graph().ranksep = 30;
            this.g.graph().nodesep = 30;
            break;
        case 'Schedule Network':
            this.Schedule = true;
            this.WBS = false;
            this.g.graph().rankdir = "LR";
            this.g.graph().ranksep = 15;
            this.g.graph().nodesep = 15;
            break;
        default:
            console.log ("graphType of "+x+" is not implemented")
    }
    this.svg = d3.select(svgelement);
    this.inner = this.svg.append("g");
    this.svg.call(d3.behavior.zoom().on("zoom", (function() {
        this.inner.attr("transform", "translate(" + d3.event.translate + ")" +
            "scale(" + d3.event.scale + ")")
    }).bind(this)));

    this.t = 0;

    this.dagreD3render = new dagreD3.render();
};

dagred3Story.prototype.animateFrame = function(RenderAfter, Frame) {
    this.t += RenderAfter
    //var that = this;
    setTimeout(function() {
        Frame.forEach(function(x) {
            if (this.Schedule) {
                switch(x[0]) {
                    case 'setActivity':
                        this.g.setNode(x[1],{})
                        break;
                    case 'removeNode':
                        this.g.removeNode(x[1])
                        break;
                    case 'setMilestone':
                        this.g.setNode(x[1],{ shape: 'diamond', style: "fill: #fff; stroke: #000" })
                        break;
                    case 'AddCoherenceEdge':
                        this.g.setEdge(x[1], x[2], {
                            lineInterpolate: 'basis'
                        });
                        break;
                    case 'AddDependencyEdge':
                        this.g.setEdge(x[1], x[2], {
                            lineInterpolate: 'basis'
                            ,label: 'added'
                            ,labeloffset: 5
                            ,labelpos: 'l'
                        });
                        break;
                    case 'MakeRedundantEdge':
                        this.g.setEdge(x[1], x[2], {
                            style: "stroke: #aaa;   stroke-dasharray: 5, 10;"
                            ,lineInterpolate: 'basis'
                            ,arrowheadStyle: "fill: #aaa"
                            ,labelpos: 'c'
                            ,label: 'pruned'
                            ,labelStyle: 'stroke: #aaa'
                        });
                        break;
                    case 'RemoveEdge':
                        this.g.removeEdge(x[1], x[2]);
                        break;
                    default:
                        console.log ("Schedule Network element "+x+" is not implemented")
                }
            } else if (this.WBS ) {
                switch(x[0]) {
                    case 'setComponent':
                        this.g.setNode(x[1],{})
                        break;
                    case 'AddWBSEdge':
                        this.g.setEdge(x[1], x[2], {
                            arrowhead: 'undirected'
                        });
                        break;
                    default:
                        console.log ("WBS element "+x+" is not implemented")
                }
            }
        }.bind(this))

        if (this.g) {
            // Render
            this.dagreD3render(this.inner,this.g);
        }
    }.bind(this), this.t)
};

dagred3Story.prototype.animateStory = function(RenderAfter, Story) {
    this.t += RenderAfter
    setTimeout(function() {
        Story.forEach(function(Frame) {
            this.animateFrame(this.interframetime, Frame);
        }.bind(this))
    }.bind(this), this.t)
};
