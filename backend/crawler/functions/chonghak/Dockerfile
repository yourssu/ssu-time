FROM public.ecr.aws/lambda/python:3.11

# 1. 필수 의존성 설치 (Amazon Linux 2023 호환)
# Chrome for Testing이 실행되기 위한 라이브러리들을 모두 포함합니다.
RUN yum -y update && \
    yum -y install \
    atk cups-libs gtk3 libXcomposite alsa-lib \
    libXcursor libXdamage libXext libXi libXrandr libXScrnSaver \
    libXtst pango at-spi2-atk libXt xorg-x11-server-Xvfb \
    xorg-x11-xauth dbus-glib dbus-glib-devel nss mesa-libgbm \
    libdrm libxkbcommon libxshmfence \
    unzip jq wget \
    && yum clean all

# ---------------------------------------------------------------------------
# [핵심 변경] Chrome for Testing & ChromeDriver (버전 고정: 131.0.6778.85)
# ---------------------------------------------------------------------------

# 2. Chrome for Testing 바이너리 다운로드 및 설치
RUN wget https://storage.googleapis.com/chrome-for-testing-public/131.0.6778.85/linux64/chrome-linux64.zip && \
    unzip chrome-linux64.zip && \
    mv chrome-linux64 /opt/chrome && \
    ln -s /opt/chrome/chrome /usr/bin/google-chrome && \
    rm chrome-linux64.zip

# 3. ChromeDriver 다운로드 및 설치 (브라우저와 동일 버전)
RUN wget https://storage.googleapis.com/chrome-for-testing-public/131.0.6778.85/linux64/chromedriver-linux64.zip && \
    unzip chromedriver-linux64.zip && \
    mv chromedriver-linux64/chromedriver /usr/bin/chromedriver && \
    chmod +x /usr/bin/chromedriver && \
    rm chromedriver-linux64.zip

# ---------------------------------------------------------------------------

# 4. 파이썬 의존성 설치
COPY functions/chonghak/requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install -r requirements.txt

# 5. 소스 코드 복사
COPY common/python ${LAMBDA_TASK_ROOT}/common
COPY functions/chonghak/handler.py ${LAMBDA_TASK_ROOT}

CMD [ "handler.lambda_handler" ]