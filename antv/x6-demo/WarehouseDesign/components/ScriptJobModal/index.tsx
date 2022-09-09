import SqlModal from '@/components/DevModal';
import ScriptJobModal from './scriptJobContent';
import { useRef } from 'react';
import DevButton from '@/components/DevButton';
import { connect } from 'dva';

interface IProps {
  visible: boolean;
  tabKey: string;
  onCancel: () => void;
  dataLoading: boolean;
  scriptJobModelData: any;
  dataLoadingUpdate: any;
}

const textStatus = {
  add: 'Script作业（新增）',
  edit: 'Script作业（编辑）',
  preview: 'Script作业详情',
};

const SqlJobAdd: React.FC<IProps> = (props) => {
  const { visible, onCancel, dataLoading, scriptJobModelData, dataLoadingUpdate } = props;
  const childRef = useRef<any>();

  const save = () => {
    if (childRef?.current?.checkParams) {
      childRef?.current?.checkParams();
    }
  };

  // 命令预览
  const commandPreview = () => {
    if (childRef?.current?.commandPreview) {
      childRef?.current?.commandPreview();
    }
  };

  return (
    <div>
      {visible && (
        <SqlModal
          visible={visible}
          forceRender
          // confirmLoading={dataLoading}
          title={textStatus[scriptJobModelData?.data?.type]}
          okText="确定"
          cancelText="取消"
          width="80%"
          onCancel={onCancel}
          // onOk={()=> form.submit()}
          destroyOnClose
          footer={null}
          closable={false}
          centered
        >
          <div>
            <section>
              <ScriptJobModal cRef={childRef} onCancel={onCancel} />
            </section>
          </div>
          <div style={{ position: 'absolute', top: '9px', right: '47px' }}>
            <DevButton onClick={commandPreview}>命令预览</DevButton>
            <DevButton onClick={onCancel} style={{ marginLeft: '10px' }}>
              取消
            </DevButton>
            <DevButton
              onClick={save}
              type="primary"
              style={{ marginLeft: '10px' }}
              loading={dataLoading || dataLoadingUpdate}
              disabled={scriptJobModelData?.data?.type === 'preview'}
            >
              确认
            </DevButton>
          </div>
        </SqlModal>
      )}
    </div>
  );
};

export default connect(
  ({
    sqlJobModel,
    fileListModel,
    loading,
  }: {
    sqlJobModel: any;
    fileListModel: any;
    loading: { effects: Record<string, boolean> };
  }) => ({
    dataLoading: loading.effects['sqlJobModel/saveJob'],
    dataLoadingUpdate: loading.effects['sqlJobModel/editJob'],
    scriptJobModelData: sqlJobModel.scriptJobModelData,
    tabKey: fileListModel.tabKey,
  }),
)(SqlJobAdd);
