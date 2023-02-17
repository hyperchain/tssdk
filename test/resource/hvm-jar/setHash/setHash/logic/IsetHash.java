package com.hyperchain.contract.setHash.logic;

import cn.hyperchain.contract.BaseContractInterface;

public interface IsetHash extends BaseContractInterface{
    public boolean setHash(String key, Object obj);
    public int getSize();
}
