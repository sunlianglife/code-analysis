// console.log(aa.match(/issue\D*\d{6}/g))
// @ts-nocheck
/* eslint-disable */
import styles from './sqlJobContent.less';
import { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { Form, message, Modal, Row, Spin, Switch, Tabs } from 'antd';
import DevButton from '@/components/DevButton';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-mysql';
// import 'ace-builds/src-noconflict/theme-textmate';
import 'brace/theme/tomorrow';
import ace from 'brace';
import 'brace/ext/language_tools'; // 增加代码提⽰
import 'brace/ext/searchbox';

import { ImpalaKeyArr } from '@/utils/mode-impala';
import { lexer } from 'sql-parser';
import { format } from 'sql-formatter';
import { connect } from 'dva';
import service from './service';
import DInput, { DTextArea } from '@/pages/DataDevelopment/components/DInput';
import MyTable from '@/components/CommonTable';
import Pagination from '@/pages/DataDevelopment/components/Pagination';
import SelectM from '@/components/Select';
import { AddIcon, FileOutlinedIcon, ReloadOutlinedIcon } from '@/pages/DataDevelopment/icon';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import DevModal from '@/components/DevModal';
import ModalInfo from '../ModalInfo';
import type { ActionType, ProColumns } from '@ant-design/pro-table';

const { TabPane } = Tabs;
const langTools = ace?.acequire
  ? ace?.acequire('ace/ext/language_tools')
  : ace?.require('ace/ext/language_tools');

const SqlJobContent: React.FC<any> = (props) => {
  const {
    sqlJobItem,
    cRef,
    onCancel,
    workflowId, // 工作流ID
    dispatch,
    sqlJobModelData,
    projectId, // 项目ID
    currentJSONData,
    tabKey,
    childName,
  } = props;
  const actionRef = useRef<ActionType>(); // antd-pro-Table手动触发刷新需要自定义ref
  const editor = useRef<any>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('setting');
  const [engineList, setEngineList] = useState<any>([]);
  const [engineInfo, setEngineInfo] = useState<any>({});
  const [preview, setPreview] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [retryFlag, setRetryFlag] = useState(true);
  const [paonesInfo, setPaonesInfo] = useState<any>({
    type: [],
    createName: [],
    testName: [],
    testStatus: [],
    des: [],
  });
  const [engineDetail, setEngineDetail] = useState('');
  const [visible, setVisible] = useState(false);
  const [infoData, setInfoData] = useState('');
  const [codeEdit, setCodeEdit] = useState(false);
  const [sqlJobCode, setSqlJobCode] = useState(''); // 初始代码区域的代码

  const [sqlValue, setSqlValue] = useState<any>(''); // 操作区的sql
  const [varMapData, setVarMapData] = useState<any>({});
  const [initCompleters, setInitCompleters] = useState<any>([]); // 暂存组件自带的关键字提示，自定义提示根据需要替换或者回滚
  const [dbInfo, setDbInfo] = useState<any>({
    dbList: [],
    tableList: {},
    columnList: {},
  });
  const [allTableList, setAllTableList] = useState<any>([]);
  const [aliasMap, setAliasMap] = useState<any>({});

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cRef, () => ({
    // changeVal 就是暴露给父组件的方法
    checkParams: () => {
      form.submit();
    },
    commandPreview: () => {
      const values = form.getFieldsValue();
      if (!values.jobCodeName) {
        message.error('请先填写本作业代码！');
      } else if (!values.engine) {
        message.error('请先选择执行引擎！');
      } else {
        service
          .getCommandPreview({
            jobType: 1,
            engine: values.engine?.value || values.engine,
            jobCodeName: values.jobCodeName,
            propertiesSet: JSON.stringify(values.propertiesSet),
          })
          .then((res: any) => {
            if (res) {
              if (res.success) {
                setVisible(true);
                setInfoData(res.data);
              } else {
                message.error(res.msg);
              }
            }
          });
      }
    },
  }));

  // 获取执行引擎
  const getEngine = (key?: any) => {
    service
      .getEngineList({
        current: 1,
        engineType: 1,
      })
      .then((res: any) => {
        if (res) {
          if (res.success) {
            setEngineList(res?.data?.list.filter((item: any) => item.engineVisible) || []);
            if (key) {
              const item = res.data.list.find((i: any) => key === i.enginePath);
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              item &&
                form.setFieldsValue({
                  engine: {
                    key: item.enginePath,
                    value: item.enginePath,
                    label: item.enginePath,
                  },
                });
            }
          } else {
            message.error(res.msg);
          }
        }
      });
  };

  const getSql = (params: any, id: any) => {
    if (tabKey === 'pro') {
      setLoading(true);
      service
        .getSqlContentPro({
          jobId: id,
          flowId: workflowId,
        })
        .then((res: any) => {
          if (res) {
            if (res.success) {
              form.setFieldsValue({
                sqlContent: res.data,
              });
            } else {
              message.error(res.msg);
            }
          }
          setLoading(false);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (sqlJobItem.id) {
      getSql({ path: sqlJobItem.path }, sqlJobItem.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sqlJobItem]);

  useEffect(() => {
    if (!sqlJobModelData?.data?.id) {
      getEngine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 编辑查看默认值
    if (sqlJobModelData?.data?.id) {
      setLoading(true);
      service
        .getJobById(
          {
            jobId: sqlJobModelData?.data?.id,
          },
          tabKey,
        )
        .then((res: any) => {
          if (res) {
            if (res.success) {
              form.setFieldsValue({
                ...res.data,
                propertiesSet: res.data.propertiesSet ? JSON.parse(res.data.propertiesSet) : [],
              });
              setSqlJobCode(res.data?.sqlContent || '');
              setRetryFlag(res.data.retry);
              setEditData(res.data);
              setReadOnly(sqlJobModelData?.data?.type === 'preview');
              getEngine(res.data.engine);
              getSql({ path: res.data.sqlPath }, res.data.id);
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              paonesBlur(res.data.paones, res.data.paones);
            } else {
              message.error(res.msg);
            }
          }
          setLoading(false);
        });
    }
  }, [sqlJobModelData]);

  const columns: ProColumns<any>[] = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
  ];

  const tabChange = (key: any) => {
    setActiveKey(key);
  };

  // 保存
  const onFinish = (values: any) => {
    if (codeEdit) {
      message.error('代码处于编辑状态，请处理后，再试！');
      return;
    }
    const saveData = {
      ...values,
      flowId: workflowId,
      sqlContent: values.sqlContent,
      sqlPath: sqlJobItem.path || editData.sqlPath,
      engine: values.engine?.value || values.engine,
      propertiesSet: JSON.stringify(values.propertiesSet),
      retryInterval: Number(values.retryInterval),
      retryTimes: Number(values.retryTimes),
      jobType: 1,
    };
    dispatch({
      type: sqlJobModelData?.data?.id ? 'sqlJobModel/editJob' : 'sqlJobModel/saveJob',
      payload: saveData,
      callback: (res: any) => {
        if (res) {
          if (res.success) {
            if (sqlJobModelData?.data?.id) {
              // 切换之前销毁画布中的元素
              dispatch({
                type: 'fileListModel/setFlowData',
                payload: [],
              });
              message.success('操作成功');
              // 同步更新操作区的作业名称
              const data = currentJSONData.map((item: any) => {
                if (item.shape === 'dag-edge') {
                  return {
                    id: item.id,
                    source: item.source,
                    target: item.target,
                    zIndex: item.zIndex,
                    shape: 'dag-edge',
                  };
                }
                return {
                  data: {
                    ...item.data,
                    flowId: item.flowId || item.data.flowId || item.data.tableInfo.flowId,
                    // eslint-disable-next-line
                    label: item.id == values.id ? values.name : item.data.label,
                  },
                  ports: item.ports.items,
                  id: item.id,
                  shape: 'dag-node',
                  zIndex: item.zIndex,
                  x: item.position.x,
                  y: item.position.y,
                  disabled: item?.disabled ?? false,
                  closed: item?.closed ?? true,
                };
              });
              dispatch({
                type: 'fileListModel/setFlowData',
                payload: [...data],
              });
            }
            // 重新查询所选工作流下面的job
            dispatch({
              type: 'fileListModel/getJobList',
              payload: {
                flowId: workflowId,
              },
            });
            onCancel();
          } else {
            message.error(res.msg);
          }
        }
      },
    });
  };

  // 解析paonesid
  // const addPaonesId = () => {
  //   if (sqlContent) {
  //     const ids = sqlContent.match(/issue\D*\d{6}/g);
  //     if (ids && ids.length) {
  //       const id = ids[ids.length - 1].split('=')[1];
  //       form.setFieldsValue({
  //         paones: id,
  //       });
  //       // eslint-disable-next-line @typescript-eslint/no-use-before-define
  //       paonesBlur(id, id);
  //     }
  //   }
  // };

  // 执行引擎预览
  const onPreview = () => {
    const info = form.getFieldValue('engine');
    if (!info) {
      message.error('请先选择执行引擎!');
      return;
    }
    service
      .getEngineInfo({
        enginePath: info?.value || info,
      })
      .then((res: any) => {
        if (res) {
          if (res.success) {
            setEngineInfo(res?.data || {});
            setPreview(true);
            service
              .getEngineDetail({
                path: info?.value || info,
              })
              .then((resp: any) => {
                if (resp) {
                  if (resp.success) {
                    setEngineDetail(resp?.data || {});
                  } else {
                    message.error(resp.msg);
                  }
                }
              });
          } else {
            message.error(res.msg);
          }
        }
      });
  };

  const retryChange = (value: any) => {
    setRetryFlag(value);
  };

  const paonesBlur = (value: any, valueString?: any) => {
    // 246771,246772
    if (valueString || value?.target?.value) {
      service
        .getInfoByPaonesId({
          issueIds: valueString || value.target.value,
        })
        .then((res: any) => {
          if (res) {
            if (res.success) {
              const type: any = [];
              const createName: any = [];
              const testName: any = [];
              const testStatus: any = [];
              const des: any = [];
              if (res.data?.length) {
                res.data.forEach((item: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.type_name && type.push(`${item.type_name}(${item.issue_id})`);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.creator_name && createName.push(`${item.creator_name}(${item.issue_id})`);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.part_qa && testName.push(`${item.part_qa}(${item.issue_id})`);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.qa_status && testStatus.push(`${item.qa_status}(${item.issue_id})`);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.issue_desc && des.push(`${item.issue_desc}(${item.issue_id})`);
                });
              }
              setPaonesInfo({
                type,
                createName,
                testName,
                testStatus,
                des,
              });
            } else {
              message.error(res.msg);
            }
          }
        });
    }
  };

  // 命令预览弹框
  const cancel = () => {
    setVisible(false);
  };

  // 根据sql获取标题
  const getTitle = (type: string, flag: boolean) => {
    if (type === 'edit') {
      setCodeEdit(flag);
    } else if (type === 'reduction') {
      if (sqlJobCode) {
        service
          .getTitle({
            flowId: workflowId,
            jobId: sqlJobModelData?.data?.id,
            projectId,
            sql: sqlJobCode,
          })
          .then((res: any) => {
            if (res.success) {
              form.setFieldsValue({
                jobCodeName: `${res.data}.dml.sql`,
                name: `${res.data}.dml`,
              });
              childName(`${res.data}.dml`);
              setCodeEdit(flag);
            } else {
              message.error(res.msg);
            }
          });
      } else {
        form.setFieldsValue({
          jobCodeName: '',
          name: '',
        });
        childName('');
      }
    } else {
      service
        .getTitle({
          flowId: workflowId,
          jobId: sqlJobModelData?.data?.id,
          projectId,
          sql: form.getFieldValue('sqlContent'),
        })
        .then((res: any) => {
          if (res) {
            if (res.success) {
              form.setFieldsValue({
                jobCodeName: `${res.data}.dml.sql`,
                name: `${res.data}.dml`,
              });
              childName(`${res.data}.dml`);
              setCodeEdit(flag);
            } else {
              message.error(res.msg);
            }
          }
        });
    }
  };

  const iconClick = (key: string) => {
    switch (key) {
      case 'edit':
        if (sqlJobModelData?.data?.id) {
          service.getJobInfo({ jobId: sqlJobModelData?.data?.id }).then((res: any) => {
            if (res?.data?.status === 1) {
              message.error('请先取消代码提交后，再进行编辑！');
            } else {
              getTitle('edit', true);
            }
          });
        } else {
          getTitle('edit', true);
        }
        break;
      case 'editOut':
        getTitle('', false);
        break;
      case 'save':
        getTitle('', false);
        break;
      case 'format':
        form.setFieldsValue({
          sqlContent: format(form.getFieldValue('sqlContent')),
        });
        break;
      case 'reduction':
        Modal.confirm({
          title: '确定要将代码回退到作业配置页刚打开时的版本吗？',
          icon: <ExclamationCircleOutlined />,
          onOk() {
            form.setFieldsValue({
              sqlContent: sqlJobCode,
            });
            setCodeEdit(false);
            getTitle('reduction', false);
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        break;
      default:
        break;
    }
  };

  const setTableCols = (cols) => {
    setAllTableList(allTableList.concat(cols));
  };

  const getTableCols = (tokens, index, dbName, callback) => {
    let tableColList: any = [];
    // 如果输入的表名在查找到的表名列表中
    if (tokens[index + 1][0] === 'DOT' && tokens[index + 2] && tokens[index + 2][0] === 'LITERAL') {
      const tableName = tokens[index + 2][1];
      if (dbInfo.tableList[dbName].indexOf(tableName) === -1) {
        return;
      }
      // 查找该表名的字段
      const columnKey = `${dbName}.${tableName}`;
      if (dbInfo.columnList[columnKey] && dbInfo.columnList[columnKey].length > 0) {
        // 如果state中存在该表字段
        tableColList = tableColList.concat(dbInfo.columnList[columnKey]);
        callback(tableColList);
      } else {
        // 如果不存在，去后台查找
        service.getField({ db: dbName, table: tableName }).then((res: any) => {
          dbInfo.columnList[columnKey] = res.data;
          tableColList = tableColList.concat(res.data);
          callback(tableColList);
          setDbInfo(dbInfo);
        });
      }
      // 如果后面有as 或者直接跟LITERAL则认为是别名
      aliasMap[tableName] = `${dbName}.${tableName}`;
      if (tokens[index + 3] && tokens[index + 3][0] === 'AS' && tokens[index + 4]) {
        // 有as
        aliasMap[tokens[index + 4][1]] = `${dbName}.${tableName}`;
      } else if (tokens[index + 3] && tokens[index + 3][0] === 'LITERAL') {
        // 没有 as
        aliasMap[tokens[index + 3][1]] = `${dbName}.${tableName}`;
      }
      setAliasMap(aliasMap);
    }
    // this.setState({tableColList: []}, ()=> {
    //
    // })
  };

  const checkSql = (value: any) => {
    const tokens = lexer.tokenize(value);
    tokens.forEach((record: any, index: number) => {
      // 如果第一个遇到的record[0]为LITERAL，则表示为库，判断库是否存在，如果存在，判断下一个是否为'.',如果是，就获取再下个record[0],表示为表名
      if (
        record[0] === 'LITERAL' &&
        tokens[index + 1] &&
        dbInfo.dbList.filter((db) => db === record[1]).length !== 0
      ) {
        // 如果库存在，则查找该库的表
        // 从state中查找是否已经查找过该库的表
        const dbName = record[1];
        if (dbInfo.tableList[dbName] && dbInfo.tableList[dbName].length > 0) {
          // 表在state中存在
          getTableCols(tokens, index, dbName, (list) => {
            setTableCols(list);
          });
        } else {
          // 如果不存在，去后台查找
          service.getTableList({ db: dbName }).then((res: any) => {
            dbInfo.tableList[dbName] = res.data;
            setDbInfo(dbInfo);
            getTableCols(tokens, index, dbName, (list) => {
              setTableCols(list);
            });
          });
        }
      }
    });
  };

  const setFilter = (prefix, meta, list) => {
    const result = list
      .map((record, index) => {
        if (record.indexOf(prefix.toLowerCase()) !== -1) {
          return {
            caption: record,
            name: record.split(' ')[0],
            value: record.split(' ')[0],
            score: -index * 100,
            meta,
            // completer: {
            //   insertMatch(editor, data) {
            //     editor.removeWordLeft();
            //     editor.insert(data.value);
            //     if (data.meta === 'ai') {
            //       track('pc_clk', {
            //         tgt_name: '表名算法提示',
            //       });
            //     }
            //   },
            // },
          };
        }
        return null;
      })
      .filter((record) => !!record);
    return result;
  };

  const getKeyIndex = (wordArrays) => {
    let index = 0;
    wordArrays.some((k, i) => {
      if (k.trim().toLowerCase() === 'from') {
        index = i + 1;
        return true;
      }
      return false;
    });
    return index;
  };

  const AceEditorChange = (sql: any) => {
    console.log(editor);
    setSqlValue(sql);
    editor.current.editor.resize();
    // 判断变量
    const regex = /\$\{(?:(\S+))}/gi;
    const varMap = {};
    let m = null;
    while (true) {
      m = regex.exec(sql);
      if (m === null) {
        break;
      }
      if (m.index === regex.lastIndex) {
        regex.lastIndex += 1;
      }
      if (m.length === 2) {
        const temp = m[0];
        varMap[m[1]] = temp;
      }
    }
    setVarMapData(varMap);
    // const contextType = this.context;
    if (editor.current.editor.completer && !editor.current.editor.completer.exactMatch) {
      editor.current.editor.completer.detach();
    }
    // ---TODO
    const before = editor.current.editor.getTextBeforeCursor(';');
    const after = editor.current.editor.getTextAfterCursor(';');
    checkSql(
      `${before}${after}`
        .replace('${', '')
        .replace('}', '')
        .replace(/[^A-Za-z0-9_ .*()>=<!+-/,\n]|!+/g, ''),
    );
    // editor.current.editor.completers.push({
    //   getCompletions: function (editors, session, pos, prefix, callback) {
    //       callback(null, completers);
    //   }
    // });
    editor.current.editor.completers = [
      {
        getCompletions: (editor, session, pos, prefix, callback) => {
          // console.log(2, editor.getTextBeforeCursor())
          let dbList: any = [];
          const sqlvalue = editor.getTextBeforeCursor(';');
          const testValue = sqlvalue.substring(sqlvalue.lastIndexOf(' ')).trim();
          const testValueArr = testValue.substring(testValue.indexOf('=') + 1).split('.');
          let allKeyStr = [];
          let allCols = [];
          const aiTableList: any = [];
          if (testValueArr.length === 1) {
            // 获取库名
            // if (contextType.editorType === 'impala') {
            //   allKeyStr = this.setFilter(prefix, 'keyword', ImpalaKeyArr); // 自带关键词提示
            // }
            allKeyStr = setFilter(prefix, 'keyword', ImpalaKeyArr); // 自带关键词提示
            allCols = setFilter(prefix, 'col', allTableList);
            const beforeArrays = before.replace(/\r\n/g, ' ').replace(/\n/g, ' ').split(' ');
            const index = getKeyIndex(beforeArrays);
            let lastKey = '';
            for (let i = beforeArrays.length - 2; i > 3; i -= 1) {
              if (beforeArrays[i] !== '') {
                lastKey = beforeArrays[i];
                break;
              }
            }
            if (
              beforeArrays.length > 1 &&
              (lastKey === 'join' || lastKey === '[shuffle]' || lastKey === '[broadcast]')
            ) {
              if (dbInfo.dbList && dbInfo.dbList.length !== 0) {
                dbList = setFilter(prefix, 'database', dbInfo.dbList);
              }
              callback(null, [].concat(aiTableList, dbList));
              // contextType.getAiTableList(beforeArrays[index], result => {
              //   if (result.msg === 'OK') {
              //     aiTableList = result.data;
              //     aiTableList = this.setFilter(prefix, 'ai', aiTableList);
              //     callback(null, [].concat(aiTableList, dbList));
              //     if (aiTableList.length > 0) {
              //       track('pc_element_imp', {
              //         tgt_name: '算法表',
              //       });
              //     }
              //   }
              // });
            } else if (dbInfo.dbList && dbInfo.dbList.length !== 0) {
              callback(
                null,
                [].concat(allKeyStr, setFilter(prefix, 'database', dbInfo.dbList), allCols),
              );
            } else {
              callback(null, [].concat(allKeyStr, dbList, allCols));
            }
          } else if (testValueArr.length === 2) {
            // 如果是别名
            if (aliasMap[testValueArr[0]]) {
              callback(
                null,
                setFilter(prefix, 'col', dbInfo.columnList[aliasMap[testValueArr[0]]]),
              );
            } else if (
              dbInfo.tableList[testValueArr[0]] &&
              dbInfo.tableList[testValueArr[0]].length !== 0
            ) {
              // 获取表名getTableList
              callback(null, setFilter(prefix, 'table', dbInfo.tableList[testValueArr[0]]));
            } else {
              service.getTableList({ db: testValueArr[0] }).then((res: any) => {
                dbInfo.tableList[testValueArr[0]] = res.data;
                setDbInfo(dbInfo);
                dbList = setFilter(prefix, 'table', res.data);
              });
            }
          } else if (testValueArr.length === 3) {
            // 获取字段名getColumnList
            const columnKey = `${testValueArr[0]}.${testValueArr[1]}`;
            if (dbInfo.columnList[columnKey] && dbInfo.columnList[columnKey].length !== 0) {
              callback(null, setFilter(prefix, 'col', dbInfo.columnList[columnKey]));
            } else {
              service.getField({ db: testValueArr[0], table: testValueArr[1] }).then((res: any) => {
                dbInfo.columnList[columnKey] = res.data;
                setDbInfo(dbInfo);
                callback(null, dbList);
              });
            }
          }
        },
      },
    ];
  };

  // 获取数据库list
  useEffect(() => {
    service.getDbList().then((res: any) => {
      setDbInfo({
        ...dbInfo,
        dbList: res.data,
      });
    });
  }, []);

  const complete = (refEditor: any) => {
    const newRefEditor = refEditor;
    if (refEditor) {
      setInitCompleters(refEditor.completers);
      const AceRange = ace?.acequire
        ? ace?.acequire('ace/range').Range
        : ace?.require('ace/range').Range;
      newRefEditor.getTextBeforeCursor = function a(separator: any) {
        const _ = new AceRange(0, 0, this.getCursorPosition().row, this.getCursorPosition().column);
        return separator
          ? this.session.getTextRange(_).split(separator).pop()
          : this.session.getTextRange(_);
      };
      newRefEditor.getTextAfterCursor = function a(separator: any) {
        const _ = new AceRange(
          this.getCursorPosition().row,
          this.getCursorPosition().column,
          this.session.getLength(),
          this.session.getRowLength(this.session.getLength()),
        );
        return separator
          ? this.session.getTextRange(_).split(separator).shift()
          : this.session.getTextRange(_);
      };
    }
  };

  return (
    <div className={styles.sqlJobContent}>
      <section>
        <Tabs defaultActiveKey="setting" onChange={tabChange}>
          <TabPane tab="作业设置" key="setting"></TabPane>
          {/* <TabPane tab="变更查看" key="preview"></TabPane> */}
        </Tabs>
      </section>
      <section>
        <Spin spinning={loading}>
          {activeKey === 'setting' ? (
            <Form
              form={form}
              onFinish={onFinish}
              className={styles.devForm}
              preserve={false}
              initialValues={{
                retry: true,
              }}
            >
              {/* <div className={styles.sqlPreview}>
                <span className={styles.title}>代码预览:</span>
                <DevButton onClick={addCode} type="primary" disabled={readOnly}>
                  添加此代码
                </DevButton>
              </div> */}
              <div className={styles.sqlPreview} style={{ display: 'block' }}>
                <span className={styles.title}>代码操作:</span>
                {!readOnly && tabKey === 'dev' && (
                  <span>
                    {!codeEdit && (
                      <EditOutlined
                        title="编辑"
                        style={{ color: '#9e9a9a', fontSize: '18px', marginLeft: '15px' }}
                        onClick={() => iconClick('edit')}
                      />
                    )}
                    {codeEdit && (
                      <FormOutlined
                        title="退出编辑"
                        style={{ color: '#9e9a9a', fontSize: '18px', marginLeft: '15px' }}
                        onClick={() => iconClick('editOut')}
                      />
                    )}
                    {codeEdit && (
                      <SaveOutlined
                        title="手动保存"
                        style={{ color: '#9e9a9a', fontSize: '18px', marginLeft: '15px' }}
                        onClick={() => iconClick('save')}
                      />
                    )}
                    {codeEdit && (
                      <ReloadOutlinedIcon
                        title="格式化"
                        style={{ color: '#9e9a9a', fontSize: '16px', marginLeft: '15px' }}
                        onClick={() => iconClick('format')}
                      />
                    )}
                    {codeEdit && (
                      <FileOutlinedIcon
                        title="还原为初始"
                        style={{ color: '#9e9a9a', fontSize: '16px', marginLeft: '15px' }}
                        onClick={() => iconClick('reduction')}
                      />
                    )}
                  </span>
                )}
              </div>
              <Form.Item
                name="sqlContent"
                label=""
                style={{ marginTop: 7 }}
                rules={[{ required: true, message: '请输入' }]}
              >
                <AceEditor
                  ref={editor}
                  mode="mysql"
                  theme="tomorrow"
                  name="UNIQUE_ID_OF_DIV"
                  height="320px"
                  className={styles.ace_editor}
                  readOnly={!codeEdit || readOnly}
                  editorProps={{ $blockScrolling: true }}
                  onChange={AceEditorChange}
                  width="calc(100% + 35px)"
                  style={{ marginLeft: '-35px' }}
                  onLoad={complete}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true,
                  }}
                />
              </Form.Item>
              <div className={styles.addFiled}>
                <section>
                  <Form.Item name="id" label="id" style={{ width: '80%', display: 'none' }}>
                    <DInput disabled={readOnly} />
                  </Form.Item>
                  <Form.Item
                    name="jobCodeName"
                    rules={[
                      { required: true, message: '请输入' },
                      { pattern: new RegExp('.+\\.dml\\.sql$'), message: '作业代码只能以.dml.sql结尾'}
                    ]}
                    label="本作业代码"
                    style={{ width: '80%' }}
                  >
                    <DInput placeholder="根据sql生成" disabled={readOnly} />
                  </Form.Item>
                  <Form.Item name="name" label="作业名" style={{ width: '80%' }}>
                    <DInput placeholder="根据sql生成" disabled />
                  </Form.Item>
                  <div style={{ display: 'flex' }}>
                    <Form.Item
                      name="engine"
                      label="执行引擎"
                      style={{ width: 'calc(80% - 80px)' }}
                      rules={[{ required: true, message: '请选择' }]}
                    >
                      {/* <DInput /> */}
                      <SelectM
                        showSearch
                        labelInValue
                        placeholder="请选择"
                        optionlist={engineList}
                        disabled={readOnly}
                        labelkey="enginePath"
                        label="enginePath"
                        style={{ width: '250px' }}
                      />
                    </Form.Item>
                    <DevButton type="primary" onClick={onPreview}>
                      预览
                    </DevButton>
                  </div>

                  <Form.Item label="添加脚本参数" style={{ width: '80%' }}>
                    <section
                      className={styles.formItemControlWrap}
                      style={{ width: 'calc(100% + 35px)' }}
                    >
                      <Form.List name={['propertiesSet']}>
                        {(fields, { add, remove }) => (
                          <div className={styles.rowItem} style={{ width: '100%' }}>
                            {fields.map((field: any) => (
                              <div style={{ display: 'flex' }} key={field.key}>
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'key']}
                                  fieldKey={[field.fieldKey, 'name']}
                                  style={{ width: '90%' }}
                                >
                                  <DInput
                                    disabled={readOnly}
                                    placeholder={readOnly ? '' : '参数'}
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'value']}
                                  fieldKey={[field.fieldKey, 'name']}
                                  style={{ width: '90%' }}
                                  rules={[
                                    {
                                      required: true,
                                      message: '请输入',
                                    },
                                  ]}
                                >
                                  <DInput disabled={readOnly} placeholder={readOnly ? '' : '值'} />
                                </Form.Item>
                                <DeleteOutlined
                                  style={{
                                    color: '#9e9a9a',
                                    fontSize: '16px',
                                    padding: '10px 0 0 10px',
                                  }}
                                  onClick={() => !readOnly && remove(field.name)}
                                />
                              </div>
                            ))}
                            <Form.Item className={styles.rowOpts} style={{ width: '100%' }}>
                              <DevButton
                                style={{ width: '100%' }}
                                className={styles.btnAddItem}
                                onClick={() => !readOnly && add()}
                                icon={<AddIcon />}
                              >
                                <span className={styles.txtWarning}>添加</span>
                              </DevButton>
                            </Form.Item>
                          </div>
                        )}
                      </Form.List>
                    </section>
                  </Form.Item>
                  <Form.Item
                    name="retry"
                    label="自动重跑"
                    style={{ width: '80%', marginTop: '-24px' }}
                    valuePropName="checked"
                  >
                    <Switch disabled={readOnly} onChange={retryChange} />
                  </Form.Item>
                  {retryFlag && (
                    <Form.Item
                      name="retryTimes"
                      label="重跑次数"
                      style={{ width: '80%' }}
                      rules={[
                        {
                          required: retryFlag,
                          pattern: /^[0-9]*[1-9][0-9]*$/,
                          message: '支持输入数字',
                        },
                      ]}
                    >
                      <DInput placeholder="请输入" disabled={readOnly} />
                    </Form.Item>
                  )}
                  {retryFlag && (
                    <Form.Item
                      name="retryInterval"
                      label="重跑间隔"
                      style={{ width: '80%' }}
                      rules={[
                        {
                          required: retryFlag,
                          pattern: /^[0-9]*[1-9][0-9]*$/,
                          message: '支持输入数字',
                        },
                      ]}
                    >
                      <DInput placeholder="单位秒" disabled={readOnly} />
                    </Form.Item>
                  )}
                </section>
                <section>
                  <Form.Item
                    name="paones"
                    label="请输入需求ID"
                    style={{ width: '80%' }}
                    // rules={[{ required: true, message: '请输入' }]}
                  >
                    <DInput
                      placeholder={readOnly ? '' : '如有多个请用英文逗号隔开'}
                      disabled={readOnly}
                      onBlur={paonesBlur}
                    />
                  </Form.Item>
                  <Form.Item
                    name="comment"
                    label="备注"
                    style={{ width: '80%' }}
                    // rules={[{ required: true, message: '请输入' }]}
                  >
                    <DTextArea
                      placeholder={readOnly ? '' : '请输入'}
                      disabled={readOnly}
                      rows={3}
                      maxLength={255}
                      showCount
                    />
                  </Form.Item>
                  <div className={styles.paonesInfo}>
                    <Row style={{ padding: '10px 0' }}>
                      {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                      问题类型 ：{/* </Col> */}
                      {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                      {paonesInfo?.type.join(',')}
                      {/* </Col> */}
                    </Row>
                    <Row style={{ padding: '10px 0' }}>
                      {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                      创建人 ：{/* </Col> */}
                      {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                      {paonesInfo?.createName.join(',')}
                      {/* </Col> */}
                    </Row>
                    <Row style={{ padding: '10px 0' }}>
                      {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                      测试人员 ：{/* </Col> */}
                      {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                      {paonesInfo?.testName.join(',')}
                      {/* </Col> */}
                    </Row>
                    <Row style={{ padding: '10px 0' }}>
                      {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                      测试状态 ：{/* </Col> */}
                      {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                      {paonesInfo?.testStatus.join(',')}
                      {/* </Col> */}
                    </Row>
                    <Row style={{ padding: '10px 0' }}>
                      {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                      需求描述 ：{/* </Col> */}
                      {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                      <span dangerouslySetInnerHTML={{ __html: paonesInfo?.des.join(',') }}></span>
                      {/* </Col> */}
                    </Row>
                  </div>
                </section>
              </div>
            </Form>
          ) : (
            <>
              <MyTable
                columns={columns}
                rowKey="id"
                request={() => {
                  // 表单搜索项会从 params 传入，传递给后端接口。
                  return Promise.resolve({
                    // data: list.list || [],
                    data: [
                      { name: 11, id: 22 },
                      { name: 22, id: 11 },
                    ],
                    success: true,
                  });
                }}
                actionRef={actionRef}
                toolBarRender={false}
                search={false}
                pagination={false}
                titleIcon={true}
                bordered
                top={23}
                // loading={loading}
                // scroll={{ x: 'max-content' }}
              />
              {/* {list.total ? ( */}
              <Pagination
                showQuickJumper={false}
                defaultCurrent={1}
                showSizeChanger
                total={100}
                // onChange={onChangeP}
                size="small"
                showTotal
                style={{ marginTop: 30 }}
              />
              {/* ) : null} */}
            </>
          )}
        </Spin>
      </section>
      <DevModal
        visible={preview}
        forceRender
        title="引擎路径"
        width={700}
        onCancel={() => setPreview(false)}
        footer={null}
      >
        <Form.Item label="" style={{ width: '80%' }}>
          <span>
            引擎路径：
            {engineInfo?.enginePath}
          </span>
        </Form.Item>
        <Form.Item label="" style={{ width: '80%' }}>
          <span>描述：{engineInfo?.engineComment}</span>
        </Form.Item>
        <Form.Item label="" style={{ width: '80%' }}>
          内容：
          <span
            dangerouslySetInnerHTML={{ __html: engineDetail?.replaceAll(/\n/g, '<br/>') }}
          ></span>
        </Form.Item>
      </DevModal>
      {visible && (
        <ModalInfo title="命令预览" visible={visible} infoData={infoData} cancel={cancel} />
      )}
    </div>
  );
};

export default connect(
  ({
    sqlJobModel,
    fileListModel,
    graphModel,
    loading,
  }: {
    sqlJobModel: any;
    fileListModel: any;
    graphModel: any;
    loading: { effects: Record<string, boolean> };
  }) => ({
    sqlJobItem: sqlJobModel.sqlJobItem,
    workflowId: fileListModel.workflowId,
    projectId: fileListModel.projectId,
    sqlJobModelData: sqlJobModel.sqlJobModelData,
    dataLoading: loading.effects['sqlJobModel/fetch'],
    currentJSONData: graphModel.currentJSONData,
    tabKey: fileListModel.tabKey,
  }),
)(SqlJobContent);
