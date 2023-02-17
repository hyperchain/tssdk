package com.hyperchain.contract.setHash.logic;

import cn.hyperchain.annotations.StoreField;
import cn.hyperchain.contract.BaseContract;
import cn.hyperchain.core.HyperMap;

public class SetHashUpdateContract extends BaseContract implements IupdateFunc {
    @StoreField
    private HyperMap<String,Object> map = new HyperMap();

    @StoreField
    public String updateStr = "updatefunc";

    @Override
    public String updateFunc() {
        return updateStr;
    }
}
