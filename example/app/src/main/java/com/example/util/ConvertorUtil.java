package com.example.util;

import com.example.entity.ABC;
import com.example.response.XYZ;

public class ConvertorUtil {
  public static XYZ convert(
      ABC source) {
    XYZ destination = new XYZ();
    destination.setX(source.getA());

    destination.setY(source.getB());

    destination.setZ(String.valueOf(source.getC()));

    destination.setStudentName(source.getStudentName());

    destination.setAge(source.getAge());

    return destination;
  }

  public String toString() {
    return "";
  }
}
