// /* eslint-disable import/no-mutable-exports */
import { useEffect, useState } from 'react';
import type { Cell } from '@antv/x6';
import { Graph } from '@antv/x6';
import NodeItem from './nodeItem';
import styles from './index.less';
import { connect } from 'dva';
import '@antv/x6-react-shape';
import './graphCommon';
import { getDvaApp } from 'umi';
import EdgeContextMenu from './edge-context-menu';
import { message } from 'antd';

// const data: any = [];

Graph.registerEdge(
  'dag-edge',
  {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#b1b1b1',
        strokeWidth: 1.5,
        targetMarker: {
          name: 'block',
          fill: '#38CCB5', // 使用自定义填充色
          stroke: '#38CCB5', // 使用自定义边框色
          args: {
            size: '6',
          },
        },
      },
    },
  },
  true,
);

export const NewGraph: any = {
  graph: '',
  nodeItemStatus: 0,
};

const AntvDagContent: React.FC<any> = (props) => {
  const {
    graphOperation,
    dispatch,
    addJobData,
    toJsonDate,
    flowData,
    currentFlowStatus,
    tabKey,
    jobPar,
    flowStatus,
    searchId,
  } = props;
  const [graph, setGraph] = useState<any>();
  const [addState, setAddState] = useState(0);

  useEffect(() => {
    NewGraph.nodeItemStatus = flowStatus;
    console.log(flowStatus, '父组件');
    Graph.registerNode(
      'dag-node',
      {
        inherit: 'react-shape',
        width: 280,
        height: 40,
        component: <NodeItem currentFlowStatus={currentFlowStatus} />,
        ports: {
          groups: {
            top: {
              position: 'top',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#C2C8D5',
                  strokeWidth: 1,
                  fill: '#fff',
                },
              },
              zIndex: 11,
            },
            bottom: {
              position: 'bottom',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#C2C8D5',
                  strokeWidth: 1,
                  fill: '#fff',
                },
              },
              zIndex: 11,
            },
          },
        },
      },
      true,
    );
  }, [tabKey, currentFlowStatus, flowStatus]);

  useEffect(() => {
    // graph && graph.dispose()
    const newGraph: any = new Graph({
      container: document.getElementById('container')!,
      // 画布自动扩展
      autoResize: true,
      // 画布滚动设置
      scroller: {
        enabled: true,
        pannable: true,
        pageVisible: true,
        pageBreak: false,
      },
      // 鼠标滚轮缩放
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl'],
      },
      // 移入高亮
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#fff',
              stroke: '#38ccb5',
              strokeWidth: 4,
            },
          },
        },
      },
      // 连接线设置
      connecting: {
        snap: {
          radius: 30,
        },
        allowBlank: false, // 是否允许连接到画布空白位置的点
        allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点
        highlight: true,
        allowMulti: false, // 是否允许在相同的起始节点和终止之间创建多条边
        allowNode: false, // 是否允许边链接到节点（非节点上的链接桩）
        // allowPort: false, // 是否允许边链接到链接桩
        connector: 'algo-connector',
        connectionPoint: 'anchor',
        anchor: 'center',
        validateMagnet({ magnet }) {
          return magnet.getAttribute('port-group') !== 'top';
        },
        createEdge() {
          return newGraph.createEdge({
            shape: 'dag-edge',
            attrs: {
              line: {
                strokeDasharray: '5 5',
                stroke: '#b1b1b1',
                strokeWidth: 1.5,
                targetMarker: {
                  name: 'block',
                  args: {
                    size: '6',
                  },
                },
              },
            },
            zIndex: -1,
          });
        },
        validateConnection({ targetPort }) {
          return targetPort?.split('-')[1] === '1'; // 只允许连接到输入桩
        },
      },
      selecting: {
        enabled: false,
        rubberband: false,
        multiple: true,
        strict: true,
        showNodeSelectionBox: false,
        selectNodeOnMoved: false,
      },
    });
    setGraph(newGraph);
    NewGraph.graph = newGraph;
    // newGraph.fromJSON(data);
  }, []);

  // 初始化节点
  const init = (list: Cell.Metadata[]) => {
    const cells: Cell[] = [];
    list.forEach((item) => {
      if (item.shape === 'dag-node') {
        cells.push(graph.createNode(item));
      } else {
        cells.push(graph.createEdge(item));
      }
    });
    graph.resetCells(cells);
    graph.centerContent();
    // 输出操作区数据
    dispatch({
      type: 'graphModel/setCurrentJSONData',
      payload: graph.toJSON().cells,
    });
  };

  // 重置节点状态
  const nodeRest = (id?: any) => {
    const nodes = graph.getNodes();
    nodes.forEach((i: any) => {
      // eslint-disable-next-line eqeqeq
      if(id != i.id){
        i.attr('body/stroke', 'null');
      }else{
        i.attr('body/stroke', '#38ccb5');
        i.attr('body/strokeWidth', '4');
      }
    });
  };

  // 重置连线状态
  const edgeRest = () => {
    const edges = graph.getEdges();
    edges.forEach((i: any) => {
      i.attr({
        line: {
          strokeDasharray: '',
          stroke: '#b1b1b1',
          strokeWidth: 1.5,
        },
      });
    });
  }

  useEffect(() => {
    if (graph) {
      graph.on('node:change:data', ({ node }: any) => {
        const edges = graph.getIncomingEdges(node);
        edges?.forEach((edge: any) => {
          edge.attr('line/strokeDasharray', '');
          edge.attr('line/style/animation', '');
        });
      });

      // 节点点击
      graph.on('node:click', ({ node }: any) => {
        nodeRest(searchId);
        node.attr('body/stroke', '#38ccb5');
        node.attr('body/strokeWidth', '4');
      });

      // 边连线之后
      graph.on('edge:connected', ({ edge }: any) => {
        edge.attr({
          line: {
            strokeDasharray: '',
            stroke: '#b1b1b1',
          },
        });
      });

      // 边单击之后
      graph.on('edge:click', ({ edge }: any) => {
        const list = [edge.store.data.source.cell, edge.store.data.target.cell]
        nodeRest(searchId);
        const nodes = graph.getNodes();
        // 高亮首位节点
        nodes.forEach((i: any) => {
          // eslint-disable-next-line eqeqeq
          if(list[0] == i.id || list[1] == i.id){
            i.attr('body/stroke', '#38ccb5');
            i.attr('body/strokeWidth', '4');
          }
        });
        // 高亮连线
        edge.attr({
          line: {
            strokeDasharray: '',
            stroke: '#505050',
            strokeWidth: 2.5,
          },
        });
      });

      // 边右键
      graph.on('edge:contextmenu', (value: any) => {
        // 开发tab下&&不在预览状态下
        if (
          getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' &&
          getDvaApp()['_store'].getState().fileListModel.workflowType === 'edit'
        ) {
          dispatch({
            type: 'graphModel/setSelectEdgeData',
            payload: {
              date: new Date().getTime(),
              data: value,
            },
          });
        } else {
          dispatch({
            type: 'graphModel/setSelectEdgeData',
            payload: {
              date: 0,
              data: {},
            },
          });
        }
      });

      // 画布点击
      graph.on('graph:contextmenu', (value: any) => {
        console.log(value);
        dispatch({
          type: 'graphModel/setSelectEdgeData',
          payload: {
            date: 0,
            data: {},
          },
        });
      });

      // 画布空白区域
      graph.on('blank:click', () => {
        nodeRest(searchId);
        edgeRest()
      });
    }
  }, [graph, searchId]);

  // 添加作业
  useEffect(() => {
    if (addJobData.date && graph) {
      graph.addNode({
        ...addJobData.data,
        x: 200 - addState * 50,
        y: 200 - addState * 50,
      });
      setAddState(addState + 1);
      message.success('已添加到操作区');
      // 添加检查作业保存一次
      if (addJobData.data.data.jobType === 2) {
        dispatch({
          type: 'graphModel/setSaveData',
          payload: {
            date: new Date().getTime(),
            data: {},
          },
        });
        // 添加检查作业时，在操作区连线自动关联所属目标作业
        const data = graph.toJSON().cells;
        jobPar.forEach((el: any) => {
          if (data.some((item: any) => String(item.id) === String(el.key))) {
            graph.addEdge({
              shape: 'dag-edge',
              target: {
                cell: el.key,
                port: `${el.key}-1`,
              },
              source: {
                cell: addJobData.data.id,
                port: `${addJobData.data.id}-2`,
              },
              zIndex: -1,
            });
          }
        });
      }
      dispatch({
        type: 'graphModel/setAddJobData',
        payload: {
          date: 0,
          data: {},
        },
      });
    }
  }, [addJobData.date]);

  // 操作区数据
  useEffect(() => {
    if (graph) {
      init(flowData);
    }
  }, [flowData]);

  // 输出操作区数据
  useEffect(() => {
    if (toJsonDate && graph) {
      dispatch({
        type: 'graphModel/setCurrentJSONData',
        payload: graph.toJSON().cells,
      });
    }
  }, [toJsonDate]);

  // 操作-放大缩小、、、
  const onHandleSideToolbar = (key: string) => {
    if (graph) {
      switch (key) {
        case 'in':
          graph.zoom(0.1);
          break;
        case 'out':
          graph.zoom(-0.1);
          break;
        case 'fit':
          graph.centerContent();
          break;
        case 'refresh':
          graph.zoomTo(1);
          break;
        default:
      }
    }
  };

  // 操作区搜索定位
  useEffect(() => {
    if(graph){
      nodeRest()
      edgeRest()
      if(searchId){
        const nodes = graph.getNodes();
        nodes.forEach((i: any) => {
          // eslint-disable-next-line eqeqeq
          if(i.id == searchId){
            i.attr('body/stroke', '#38ccb5');
            i.attr('body/strokeWidth', '4');
            graph.centerCell(i)
          }
        });
      }
    }
  }, [searchId])

  useEffect(() => {
    if (graphOperation.date) {
      onHandleSideToolbar(graphOperation.key);
    }
  }, [graphOperation]);

  return (
    <div className={styles.AntvDagContent}>
      <div id="container" style={{ flex: '1', position: 'relative' }}>
        <EdgeContextMenu />
      </div>
    </div>
  );
};

export default connect(
  ({
    graphModel,
    fileListModel,
    sqlJobModel,
  }: {
    graphModel: any;
    fileListModel: any;
    sqlJobModel: any;
  }) => ({
    graphOperation: graphModel.graphOperation,
    refreshGraph: graphModel.refreshGraph,
    addJobData: graphModel.addJobData,
    toJsonDate: graphModel.toJsonDate,
    flowData: fileListModel.flowData,
    currentFlowStatus: fileListModel.currentFlowStatus,
    tabKey: fileListModel.tabKey,
    jobPar: sqlJobModel.jobPar,
    flowStatus: graphModel.flowStatus,
    searchId: graphModel.searchId,
  }),
)(AntvDagContent);
