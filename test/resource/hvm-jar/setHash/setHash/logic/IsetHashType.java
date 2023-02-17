package com.hyperchain.contract.setHash.logic;

import cn.hyperchain.contract.BaseContractInterface;

public interface IsetHashType extends BaseContractInterface {
    public void setHashExtraSplit();
    public void setHashExtra();
    public void setHashNoRet(String key, String value);

}
