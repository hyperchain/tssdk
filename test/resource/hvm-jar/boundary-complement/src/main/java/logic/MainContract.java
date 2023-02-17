package logic;

import cn.hyperchain.annotations.StoreField;
import cn.hyperchain.core.Logger;
import cn.hyperchain.contract.BaseContract;

public class MainContract extends BaseContract {
    private static Logger logger = Logger.getLogger(MainContract.class);

    @StoreField
    int x = 5555;

    public int getX(int xTmp) {
        return xTmp;
    }

    public int getX() {
        return x;
    }
}
