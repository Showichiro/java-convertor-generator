/*
 * This Java source file was generated by the Gradle 'init' task.
 */
package com.example;

import com.example.entity.ABC;
import com.example.response.XYZ;
import com.example.util.ConvertorUtil;

public class App {

    public static void main(String[] args) {
        ABC abc = new ABC("A", true, 1, "Adam", 30);
        System.out.println(abc);
        XYZ xyz = ConvertorUtil.convert(abc);
        System.out.println(xyz);
    }
}
