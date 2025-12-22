import { ElementRef, Injectable } from "@angular/core";
import * as go from 'gojs';
import { Subscription } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class GoJsUtils2 {
    public myDiagram!: go.Diagram;
    portSize: go.Size = new go.Size(16, 16);

    private _draggingPort: {
        portObj: go.GraphObject,
        sourceNode: go.Node,
        portData: any
    } | null = null;

    private _ghostPort: go.Part | null = null;
    private _onMouseMoveListener: ((e: go.DiagramEvent) => void) | null = null;
    private _onMouseUpListener: ((e: go.DiagramEvent) => void) | null = null;

    private dataChangeSubscription!: Subscription;

    
    deletedObjects: any = []
    currentParentElementToUngroup = null;
    currentParentElementToGroup = null;

    initDiagram(diagramRef: ElementRef<HTMLDivElement>,
            onAddLinkCallback: any,
            onRemoveLinkCallback: any,
            onModifyLinkCallback: any) {
        const $ = go.GraphObject.make;
        this.myDiagram = $(go.Diagram, diagramRef.nativeElement, {
            initialContentAlignment: go.Spot.Center, // Center the diagram initially
            allowZoom: true,
            allowHorizontalScroll: true,
            allowVerticalScroll: true,
            hasHorizontalScrollbar: false,
            hasVerticalScrollbar: false,
            padding: 10,
            "toolManager.mouseWheelBehavior": go.WheelMode.Zoom,

            allowCopy: false,
            allowDelete: true,
            initialAutoScale: go.AutoScale.UniformToFill,
            validCycle: go.CycleMode.All,

            'clickCreatingTool.archetypeNodeData': { name: '(New Function)' },
            'undoManager.isEnabled': true,
            'themeManager.changesDivBackground': true,
            layout: new go.LayeredDigraphLayout({ direction: 0, layerSpacing: 500, isOngoing: false })
        });
        this.myDiagram.addDiagramListener("LinkDrawn", (e) => {
            const link = e.subject as go.Link;
            const m = this.myDiagram.model;
            m.commit(mm => {
                if (!link.data.fromPort || link.data.fromPort === "") {
                    const pid = this.ensureFlowPort(mm, link.fromNode!, "outputFlows", "out");
                    mm.setDataProperty(link.data, "fromPort", pid);
                }
                if (!link.data.toPort || link.data.toPort === "") {
                    const pid = this.ensureFlowPort(mm, link.toNode!, "inputFlows", "in");
                    mm.setDataProperty(link.data, "toPort", pid);
                }
            }, "auto-add ports for new link");
            onAddLinkCallback(e.subject.data);
        });
        this.myDiagram.addDiagramListener("LinkRelinked", (e) => {
            const link = e.subject as go.Link;
            const oldPort = e.parameter as go.GraphObject | null;   // the port that was disconnected

            if(oldPort){
                const oldPart = oldPort.part;
                if ((oldPart instanceof go.Node)) {
                    const oldNode = oldPart as go.Node;

                    onModifyLinkCallback(e.subject.data, oldPart.data, (oldPort as any).portId as string);
                }
            }
        });
        this.myDiagram.commandHandler.canDeleteSelection = () => {
            //let canDelete = go.CommandHandler.prototype.canDeleteSelection.call(this.myDiagram.selection);
            let canDelete = true;
            this.myDiagram.selection.each((selection:any) => {
                if (!(selection instanceof go.Link))
                    canDelete = false;
                else
                    this.deletedObjects.push(selection.data);
            })
            return canDelete;
        }
        this.myDiagram.addDiagramListener("SelectionDeleted", (e) => {
            onRemoveLinkCallback(this.deletedObjects);
        });
        this.myDiagram.themeManager.currentTheme = 'cosimulation';

        this.myDiagram.themeManager.set('cosimulation', {
            colors: {
                background: 'rgba(55, 255, 84, 0.08)',
                selection: 'rgba(55, 255, 84, 0.4)',
                outline: 'rgba(0,255,125,0.5)',
                text: '#fff',
                subtext: '#d1d5db',
                badgeLogical: 'rgba(55, 84, 255, 0.25)',
                badgeLogicalBorder: 'rgba(0,125,255,0.5)',
                badgeLogicalText: 'rgba(150, 200, 255, 1.0)',
                shadow: '#111827',
                dragOver: '#082f49',
                link: 'rgba(180, 255, 200, 1.0)',
                div: '#1f2937',
                divider: "rgba(0,255,125,0.8)"
            },
            numbers: {
                strokeWidth: 4
            },
            fonts: {
                b612Normal: 'normal 11pt B612',
                b612Title: 'normal 14pt B612',
            }
        });

        this.myDiagram.nodeTemplate = new go.Node(
            go.Panel.Spot, {
            isShadowed: true,
            shadowOffset: new go.Point(0, 2),
            selectionObjectName: 'BODY',
            mouseDragEnter: (e, grp, prev) => this.highlightGroup(e, grp, true),
            mouseDragLeave: (e, grp, next) => this.highlightGroup(e, grp, false),
            mouseDrop: (e, obj) => {
                if (e.handled) return;
                e.handled = true;
                this.finishDropOnFunction(e, obj);
            }
        }).add(new go.Panel(go.Panel.Auto, {
                row: 1,
                column: 1,
                name: 'BODY',
                cursor: "move",
                stretch: go.Stretch.Fill,
            }).add(new go.Shape('RoundedRectangle', { // define the node's outer shape
                    name: 'SHAPE',
                    portId: '',
                    cursor: 'pointer',
                    fromLinkable: false,
                    toLinkable: false,
                    fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
                }).theme('fill', 'background')
                    .theme('stroke', 'outline')
                    .bindObject('fill', 'isHighlighted', h => h ? 'rgba(55, 255, 84, 0.3)' : 'rgba(55, 255, 84, 0.08)')
                    .bind('height', 'height'),
                new go.Panel(go.Panel.Vertical, {
                    margin: 0.5,
                    defaultRowSeparatorStrokeWidth: 0.5,
                    alignment: go.Spot.Top
                }).theme('defaultRowSeparatorStroke', 'divider')
                    .add(
                        new go.Panel(go.Panel.Horizontal, {
                            alignment: go.Spot.Top,
                            defaultAlignment: go.Spot.Left,
                            margin: new go.Margin(0, 0, 20, 0)
                        }).add(
                            new go.TextBlock(
                                {
                                    width: 200,
                                    editable: true,
                                    overflow: go.TextOverflow.Ellipsis,
                                    maxLines: 1
                                }
                            )
                                .bindTwoWay('text', 'name')
                                .theme('stroke', 'text')
                                .theme('font', 'b612Title'),
                        )
                    )
                    .add(
                        new go.Panel(go.Panel.Horizontal, {
                            alignment: go.Spot.Top,
                            defaultAlignment: go.Spot.Left
                        }).add(
                            new go.Panel(go.Panel.Vertical, {
                                name: 'LEFTPORTS',
                                alignment: new go.Spot(0, 0.5, -this.portSize.width+10, 0),     // Align to the right-middle and offset by +10px
                                alignmentFocus: go.Spot.Left,             // Align the panel's left edge to the node's right edge
                                itemTemplate: new go.Panel(go.Panel.Horizontal, {
                                    alignment: go.Spot.Left,
                                    alignmentFocus: go.Spot.Left,
                                    fromSpot: go.Spot.Left,
                                    toSpot: go.Spot.Left,
                                    fromLinkable: false,
                                    toLinkable: true,
                                    cursor: 'pointer',
                                    click: (e: go.InputEvent, obj: go.GraphObject) => {
                                        e.handled = true; this.startPortDrag(e, obj)
                                    },
                                    toolTip: go.GraphObject.build("ToolTip").add(
                                        new go.Panel("Vertical").add(
                                            new go.TextBlock({ margin: 3 })
                                                .bind("text", "name")
                                        )
                                    )
                                }).bind('portId', 'id')
                                    .add(
                                        new go.Shape('Rectangle', {
                                            fill: 'blue',
                                            stroke: null,
                                            strokeWidth: 0,
                                            desiredSize: this.portSize,
                                            margin: new go.Margin(5, 0),
                                            column: 0
                                        }).themeData('fill', 'portColor', 'ports')
                                    )
                                    .add(
                                        new go.TextBlock({
                                            isMultiline: false,
                                            column: 1,
                                            margin: new go.Margin(0, 0, 0, 10)
                                        }).bindTwoWay('text', 'name')
                                            .theme('stroke', 'text')
                                            .theme('font', 'b612Normal')
                                    )
                            }).bind('itemArray', 'inputPorts')
                        ).add(
                            new go.Panel(go.Panel.Vertical, {
                                name: 'SPACECENTER',
                                width: 50
                            })
                        ).add(
                            new go.Panel(go.Panel.Vertical, {
                                name: 'RIGHTPORTS',
                                alignment: new go.Spot(1, 0.5, this.portSize.width-10, 0),     // Align to the right-middle and offset by +10px
                                alignmentFocus: go.Spot.Right,             // Align the panel's left edge to the node's right edge
                                itemTemplate: new go.Panel(go.Panel.Horizontal, {
                                    alignment: go.Spot.Right,
                                    alignmentFocus: go.Spot.Right,
                                    fromSpot: go.Spot.Right,
                                    toSpot: go.Spot.Right,
                                    fromLinkable: true,
                                    toLinkable: false,
                                    fromLinkableDuplicates: true,
                                    cursor: 'pointer',
                                    click: (e: go.InputEvent, obj: go.GraphObject) => {
                                        e.handled = true; this.startPortDrag(e, obj)
                                    },
                                    toolTip: go.GraphObject.build("ToolTip").add(
                                        new go.Panel("Vertical").add(
                                            new go.TextBlock({ margin: 3 })
                                                .bind("text", "name")
                                        )
                                    )
                                }).bind('portId', 'id')
                                    .add(
                                        new go.TextBlock({
                                            isMultiline: false,
                                            column: 0,
                                            margin: new go.Margin(0, 10, 0, 0)
                                        }).bindTwoWay('text', 'name')
                                            .theme('stroke', 'text')
                                            .theme('font', 'b612Normal')
                                    )
                                    .add(
                                        new go.Shape('Rectangle', {
                                            fill: 'red',
                                            column: 1,
                                            stroke: null,
                                            strokeWidth: 0,
                                            desiredSize: this.portSize,
                                            margin: new go.Margin(5, 0)
                                        }).themeData('fill', 'portColor', 'ports')
                                    )
                            }).bind('itemArray', 'outputPorts'),
                        )
                    )
            )

        )

        this.myDiagram.linkTemplate = new go.Link({
            routing: go.Routing.Orthogonal,
            corner: 25,
            curve: go.Curve.JumpGap,
            reshapable: true,
            resegmentable: true,
            relinkableFrom: true,
            relinkableTo: true,
            toEndSegmentLength: 100,
            fromEndSegmentLength: 100,
            toolTip: go.GraphObject.build("ToolTip").add(
                new go.Panel("Vertical").add(
                    new go.TextBlock({ margin: 3 })
                        .bind("text", "", (obj:any) => 'From ' + obj.fromPort.replace('##', '/') + ' to ' + obj.toPort.replace('##', '/'))
                )
            )
        })
            .add(
                new go.Shape({ stroke: 'green', strokeWidth: 2 }),
                new go.Shape({ stroke: 'green', fill: 'green', toArrow: 'Standard' }),
                new go.TextBlock({
                    segmentIndex: NaN,            // auto segment
                    segmentFraction: 0.5,
                    isMultiline: false,
                    editable: true,
                    alignment: new go.Spot(0, 1, 0, 0)
                }).theme('font', 'b612Normal')
                    .theme('stroke', 'text')
                    //.bindTwoWay('text', 'name')
            );


    }
    loadDataToDiagram(nodeDataArray:any, linkDataArray:any){
        // Wrap as required by GoJS
        const modelJson = {
            class: "go.GraphLinksModel",
            linkFromPortIdProperty: "fromPort",
            linkToPortIdProperty: "toPort",
            copiesArrays: true,
            copiesArrayObjects: true,
            nodeDataArray: nodeDataArray,
            linkDataArray: linkDataArray
        };

        //this.markLeafNodes(modelJson.nodeDataArray);

        this.myDiagram.model = go.Model.fromJson(modelJson);

        /*
        Not necessary for the moment
        let lastkey = 1;
        this.myDiagram.model.makeUniqueKeyFunction = (data) => {
            let k = this.engineeringDataService.getLastKey() + 1
            return k;
        };*/
    }
    retrieveDiagramModel(){
        return (this.myDiagram.model as go.GraphLinksModel);
    }
    // helper: move the port item {flowId: ...} from one node to another
    private transferPortItem(
        model: go.Model,
        fromNode: go.Node,
        toNode: go.Node,
        which: "inputFlows" | "outputFlows",
        flowId: string
    ) {
        const fromData: any = fromNode.data;
        const toData: any = toNode.data;

        let fromArr = fromData[which] as Array<any> | undefined;
        if (!fromArr) return;

        const idx = fromArr.findIndex(it => it.flowId === flowId);
        if (idx < 0) return;

        const item = fromArr[idx];
        model.removeArrayItem(fromArr, idx);

        let toArr = toData[which] as Array<any> | undefined;
        if (!toArr) {
            toArr = [];
            model.setDataProperty(toData, which, toArr);
        }
        // avoid accidental duplicates
        if (toArr.findIndex(it => it.flowId === flowId) < 0) {
            model.insertArrayItem(toArr, toArr.length, item);
        }
    }

    // Replace your helper with this version:
    private pruneUnusedPorts(m: go.Model, node: go.Node, which: "inputFlows" | "outputFlows") {
        const data: any = node.data;
        const arr = data[which] as Array<any> | undefined;
        if (!arr || arr.length === 0) return;

        const keep: any[] = [];
        for (const item of arr) {
            // Ask the NODE if there are links connected at this port id
            const it = node.findLinksConnected(item.flowId); // Iterator<Link>
            let hasLinks = false;
            while (it.next()) { hasLinks = true; break; }  // TS-friendly way to test non-empty
            if (hasLinks) keep.push(item);
        }

        if (keep.length !== arr.length) {
            m.setDataProperty(data, which, keep);
        }
    }

    private uniqueFlowId(arr: Array<any> | undefined, prefix: string): string {
        const a = arr ?? [];
        const taken = new Set(a.map(p => p.flowId));
        let i = a.length;
        let id = `${prefix}${i}`;
        while (taken.has(id)) { i++; id = `${prefix}${i}`; }
        return id;
    }

    private ensureFlowPort(model: go.Model, part: go.Part, which: "inputFlows" | "outputFlows", prefix: "in" | "out"): string {
        const data: any = part.data;

        // READ directly (Model has no getDataProperty for reads)
        let arr = data[which] as Array<any> | undefined;

        // WRITE via Model API so bindings + undo/redo work
        if (!arr) {
            arr = [];
            model.setDataProperty(data, which, arr);
        }

        const flowId = this.uniqueFlowId(arr, prefix);
        model.insertArrayItem(arr, arr.length, { flowId /*, portColor: "#aaa"*/ });
        return flowId;
    }

    addPort(node: any) {
        if (!node) return;
        const thisemp = node.data;

        // this.myDiagram.model.commit((m) => {
        //   console.log("Add port")
        //   let i = 0;

        //   const name = "top" + i.toString();
        //   const arr = node.data["top" + 'Array'];
        //   if (arr) {
        //         // create a new port data object
        //         const newportdata = {
        //           portId: name,
        //           portColor: '#FF0000'
        //         };
        //         // and add it to the Array of port data
        //         this.myDiagram.model.insertArrayItem(arr, -1, newportdata);
        //   }

        //   console.log(node.findPort("top" + i.toString()));
        //   console.log(node.findPort("blibli"));

        // }, 'addPort');
        this.myDiagram.startTransaction('addPort');
        this.myDiagram.selection.each((node) => {
            // skip any selected Links
            console.log(node)
            if (!(node instanceof go.Node)) return;
            // compute the next available index number for the side
            let i = 0;

            // now this new port name is unique within the whole Node because of the side prefix
            const name = "top" + i.toString();
            // get the Array of port data to be modified
            const arr = node.data["top" + 'Array'];
            if (arr) {
                // create a new port data object
                const newportdata = {
                    portId: name,
                    portColor: 'rgb(ff0000)'
                };
                // and add it to the Array of port data
                this.myDiagram.model.insertArrayItem(arr, -1, newportdata);
            }
        });
        this.myDiagram.commitTransaction('addPort');
    }

    startPortDrag(e: go.InputEvent, portObj: go.GraphObject) {
        // e.handled = true;
        // const diagram = this.myDiagram!;
        // const sourceNode = portObj.part as go.Node;
        // if (!sourceNode) return;

        // const portData = (portObj.part!.data as any)

        // // store dragging info
        // this._draggingPort = {
        //   portObj,
        //   sourceNode,
        //   portData: portData
        // };

        // // create a ghost Part that follows the mouse (layer 'Tool' or 'Foreground')
        // const $ = go.GraphObject.make;
        // this._ghostPort = $(
        //   go.Part,
        //   'Spot',
        //   { layerName: 'Tool', pickable: false }, // tool-layer, not interactive
        //   $(go.Shape, 'Rectangle', {
        //     desiredSize: this.portSize || new go.Size(12, 12),
        //     fill: 'gray',
        //     stroke: null
        //   })
        // );
        // diagram.add(this._ghostPort);
        // this._ghostPort.location = e.documentPoint;

        // // mouse move listener: move ghost
        // this._onMouseMoveListener = (evt: any) => {
        //   if (!this._ghostPort) return;
        //   // evt.documentPoint is present on Diagram events
        //   const pt = (evt as any).documentPoint || diagram.lastInput.documentPoint;
        //   if (pt) this._ghostPort.location = pt;
        // };
        // // mouse up listener: finish drag
        // this._onMouseUpListener = (evt: any) => this.finishPortDrag(evt as go.InputEvent);

        // diagram.addDiagramListener("MouseMove" as go.DiagramEventName, this._onMouseMoveListener);
        // diagram.addDiagramListener("MouseUp" as go.DiagramEventName, this._onMouseUpListener);
    }

    finishPortDrag(e: go.InputEvent) {
        const diagram = this.myDiagram!;
        if (!this._draggingPort) return;

        // remove listeners (use stored refs)
        if (this._onMouseMoveListener) diagram.removeDiagramListener("MouseMove" as go.DiagramEventName, this._onMouseMoveListener);
        if (this._onMouseUpListener) diagram.removeDiagramListener("MouseUp" as go.DiagramEventName, this._onMouseUpListener);

        const pt = e.documentPoint;
        // find a node at drop point (exclude port panels — we want the node body)
        const part = diagram.findPartAt(pt, true);
        const targetPart = (part instanceof go.Node && part.category !== "port") ? part : null;

        // convenience refs
        const { sourceNode, portData } = this._draggingPort;
        this._draggingPort = null;

        // remove ghost
        if (this._ghostPort) {
            diagram.remove(this._ghostPort);
            this._ghostPort = null;
        }

        if (!targetPart) {
            // cancelled or dropped on empty space
            return;
        }

        // if dropped on same parent -> nothing to do
        const newOwnerKey = targetPart.data.key;
        const oldOwnerKey = sourceNode.data.key;
        if (newOwnerKey === oldOwnerKey) return;

        // decide which array we move the port into on target (left/right)
        const targetArrayName = (pt.x < targetPart.location.x) ? 'inputFlows' : 'outputFlows';

        // determine source array name (search where the port lives)
        const possibleArrays = ['inputFlows', 'outputFlows'];
        let fromArrayName: string | null = null;
        for (const n of possibleArrays) {
            if (Array.isArray(sourceNode.data[n]) && sourceNode.data[n].indexOf(portData) >= 0) {
                fromArrayName = n;
                break;
            }
        }
        if (!fromArrayName) return; // can't find it — abort

        // perform model update in a transaction and update links that reference this port
        diagram.model.commit((m: any) => {
            // remove from source array
            m.removeArrayItem(sourceNode.data[fromArrayName!], sourceNode.data[fromArrayName!].indexOf(portData));

            // ensure target array exists
            if (!targetPart.data[targetArrayName]) {
                m.set(targetPart.data, targetArrayName, []);
            }
            // add to target array
            m.addArrayItem(targetPart.data[targetArrayName], portData);

            // Update links that point to this port:
            // This assumes your links store 'fromPort' / 'toPort' as the port.flowId and 'from'/'to' as the node key.
            // If your links use different fields adjust accordingly.
            diagram.links.each((link: go.Link) => {
                const ld: any = link.data;
                if (ld.fromPort === portData.flowId) {
                    // point link.from to new owner key
                    m.set(ld, 'from', newOwnerKey);
                }
                if (ld.toPort === portData.flowId) {
                    m.set(ld, 'to', newOwnerKey);
                }
            });
        }, 'move port');

        // done
    }
    finishDropOnFunction(e: go.InputEvent, thisObj: go.GraphObject) {
        const targetNode = thisObj as go.Node;
        console.log(targetNode.data);
        const diagram = targetNode.diagram;
        const draggedNode = diagram!.selection.first() as go.Node | null; // assume just one node dragged
        const model = diagram!.model;

        if (!draggedNode) return;

        const oldParentKey = draggedNode?.data.parent;

        diagram!.commit((d) => {

            if (draggedNode) {
                // Update the 'parent' key in model data
                model.setDataProperty(draggedNode.data, "parent", targetNode.data.key);
                model.setDataProperty(draggedNode.data, "group", targetNode.data.key);
            }

            // Mark new parent as not a leaf
            model.setDataProperty(targetNode.data, "isLeaf", false);
            //this.currentParentElementToGroup = this.engineeringDataService.getElementByKey(targetNode.data.key);

            // Check if old parent now has no more children → mark as leaf
            if (oldParentKey !== undefined && oldParentKey !== targetNode.data.key) {
                const oldParentNode = d.findNodeForKey(oldParentKey);
                if (oldParentNode) {
                    const hasChildren = oldParentNode.findTreeChildrenNodes().count > 0;
                    model.setDataProperty(oldParentNode.data, "isLeaf", !hasChildren);
                    if (!hasChildren) {
                        //this.currentParentElementToUngroup = this.engineeringDataService.getElementByKey(oldParentKey);
                    }
                }
            }

            //this.saveData();

        }, 'reparent node and update isLeaf');

    }
    highlightGroup(e: any, grp: any, show: any) {

        if (!grp) return;
        e.handled = true;
        if (show) {
            // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
            // instead depend on the DraggingTool.draggedParts or .copiedParts
            var tool = grp.diagram.toolManager.draggingTool;
            var map = tool.draggedParts || tool.copiedParts;  // this is a Map
            // now we can check to see if the Group will accept membership of the dragged Parts
            grp.isHighlighted = true;
            return;

        }
        grp.isHighlighted = false;
    }
    getAllocatedTo(functionAllocationToConstituent: string[]) {
        if (!functionAllocationToConstituent)
            return "";

        let componentsName = "";
        // TODO : manage request data
        /* const data = this.engineeringDataService.getData();
      
        functionAllocationToConstituent.forEach((componentKey) => {
          const pc = data.PhysicalConstituent.find((pc2:any) => pc2.key === componentKey);
          if (pc) {
            componentsName += pc.name + ", ";
          }
        });
        */
        return componentsName.slice(0, -2); // remove last comma
    }
    checkAllocatedTo(functionAllocationToConstituent: any) {
        if (!functionAllocationToConstituent) return false;
        else return true;
    }
}