import devLeft from '../../../../../public/devLeft.png';
import devRight from '../../../../../public/devRight.png';
import styles from './index.less';
import CreateProject from '../ProjectCenter/Project/CreateProject';
import { useState } from 'react';
import { qiankunPush } from '@/utils/qiankunHistory';

const Entry: React.FC<any> = () => {
  const [addVisible, setAddVisible] = useState(false);
  const [editFlag, setEditFlag] = useState(false);

  const toPage = (type: string) => {
    if (type === 'select') {
      qiankunPush('/project/development/index/warehouseDesign/project/index');
    } else {
      setEditFlag(false);
      setAddVisible(true);
    }
  };

  const cancel = () => {
    setAddVisible(false);
  };

  return (
    <div className={styles.entry}>
      <div className={styles.title}>进入项目后，开启您的开发旅程！</div>
      <div className={styles.operation}>
        <div className={styles.left}>
          <img className={'logoStyle'} src={devLeft} alt="" />
          <div className={styles.selectProject} onClick={() => toPage('select')}>
            选择项目
          </div>
        </div>
        <div className={styles.right}>
          <img className={'logoStyle'} src={devRight} alt="" />
          <div className={styles.selectProject} onClick={() => toPage('add')}>
            新建项目
          </div>
        </div>
      </div>
      {addVisible && (
        <CreateProject addVisible={addVisible} cancel={cancel} editFlag={editFlag} entryFlag />
      )}
    </div>
  );
};

export default Entry;
