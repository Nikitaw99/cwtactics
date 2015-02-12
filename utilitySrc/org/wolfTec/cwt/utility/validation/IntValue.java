package org.wolfTec.cwt.utility.validation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface IntValue {
  int max() default Integer.MAX_VALUE;

  int min() default Integer.MIN_VALUE;

  int[] not() default {};
}
