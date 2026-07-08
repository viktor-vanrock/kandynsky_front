FROM harbor.sberdevices.ru/proxy/nginxinc/nginx-unprivileged:stable-bookworm
COPY dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx","-g","daemon off;"]
